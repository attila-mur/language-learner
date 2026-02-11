// src/main/java/com/learner/controller/WordController.java
package com.learner.controller;

import com.learner.model.Language;
import com.learner.model.Topic;
import com.learner.model.Word;
import com.learner.service.WordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // For development
public class WordController {

    private final WordService wordService;

    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    @GetMapping("/languages")
    public List<Language> getLanguages() {
        return wordService.getAvailableLanguages();
    }

    @GetMapping("/topics")
    public List<Topic> getTopics() {
        return wordService.getAvailableTopics();
    }

    @GetMapping("/words")
    public List<Word> getWords(
            @RequestParam(required = false) String sourceLang,
            @RequestParam(required = false) String targetLang,
            @RequestParam(required = false, defaultValue = "all") String topic,
            @RequestParam(defaultValue = "10") int count) {

        return wordService.getRandomWords(sourceLang, targetLang, topic, count);
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAnswer(
            @RequestBody Map<String, String> request) {

        String wordId = request.get("wordId");
        String answer = request.get("answer");

        boolean correct = wordService.checkAnswer(wordId, answer);

        return ResponseEntity.ok(Map.of(
                "correct", correct,
                "message", correct ? "Correct! 🎉" : "Not quite right 😔"
        ));
    }
}