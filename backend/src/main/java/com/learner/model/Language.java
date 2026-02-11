// src/main/java/com/learner/model/Language.java
package com.learner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Language {
    private String code;    // "en", "es", "fr", etc.
    private String name;    // "English", "Spanish", "French"
}