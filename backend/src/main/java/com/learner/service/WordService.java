// src/main/java/com/learner/service/WordService.java
package com.learner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learner.model.Language;
import com.learner.model.Topic;
import com.learner.model.Word;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WordService {

    private List<Word> wordPool = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() throws IOException {
        // Load words from JSON file
        ClassPathResource resource = new ClassPathResource("words.json");
        wordPool = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Word>>() {}
        );
    }

    public List<Language> getAvailableLanguages() {
        return Arrays.asList(
                new Language("en", "Hungarian"),
                new Language("en", "English"),
                // new Language("es", "Spanish"),
                // new Language("fr", "French"),
                // new Language("de", "German"),
                // new Language("it", "Italian"),
                // new Language("pt", "Portuguese"),
                // new Language("ja", "Japanese"),
                // new Language("zh", "Chinese")
        );
    }

    public List<Topic> getAvailableTopics() {
        return wordPool.stream()
                .map(w -> new Topic(w.getTopic(), capitalize(w.getTopic()), ""))
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Word> getRandomWords(String sourceLang, String targetLang,
                                     String topic, int count) {
        List<Word> filtered = wordPool.stream()
                .filter(w -> sourceLang == null ||
                        w.getSourceLanguage().equalsIgnoreCase(sourceLang))
                .filter(w -> targetLang == null ||
                        w.getTargetLanguage().equalsIgnoreCase(targetLang))
                .filter(w -> topic == null || "all".equalsIgnoreCase(topic) ||
                        w.getTopic().equalsIgnoreCase(topic))
                .collect(Collectors.toList());

        Collections.shuffle(filtered);
        return filtered.stream()
                .limit(count)
                .collect(Collectors.toList());
    }

    public boolean checkAnswer(String wordId, String userAnswer) {
        return wordPool.stream()
                .filter(w -> w.getId().equals(wordId))
                .findFirst()
                .map(w -> w.getTargetText().equalsIgnoreCase(userAnswer.trim()))
                .orElse(false);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    // For adding words (admin functionality)
    public void addWord(Word word) {
        word.setId(UUID.randomUUID().toString());
        wordPool.add(word);
    }
}
