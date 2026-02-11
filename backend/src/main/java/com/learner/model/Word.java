// src/main/java/com/learner/model/Word.java
package com.learner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Word {
    private String id;
    private String sourceLanguage;
    private String targetLanguage;
    private String topic;
    private String sourceText;      // The word in language A
    private String targetText;      // The translation in language B
    private String pronunciation;   // Optional
    private String example;         // Example sentence
}