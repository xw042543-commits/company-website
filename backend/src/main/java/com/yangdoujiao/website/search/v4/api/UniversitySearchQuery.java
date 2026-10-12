package com.yangdoujiao.website.search.v4.api;

import java.util.List;

public class UniversitySearchQuery {

    private String q;
    private List<String> category = List.of();
    private List<String> level = List.of();
    private List<String> country = List.of();
    private List<String> mode = List.of();
    private List<String> language = List.of();
    private String duration;
    private String intake;
    private String tuitionMin;
    private String tuitionMax;
    private String page = "1";
    private String size = "12";
    private String sort = "relevance";

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }

    public List<String> getCategory() {
        return category;
    }

    public void setCategory(List<String> category) {
        this.category = category;
    }

    public List<String> getLevel() {
        return level;
    }

    public void setLevel(List<String> level) {
        this.level = level;
    }

    public List<String> getCountry() {
        return country;
    }

    public void setCountry(List<String> country) {
        this.country = country;
    }

    public List<String> getMode() {
        return mode;
    }

    public void setMode(List<String> mode) {
        this.mode = mode;
    }

    public List<String> getLanguage() {
        return language;
    }

    public void setLanguage(List<String> language) {
        this.language = language;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getIntake() {
        return intake;
    }

    public void setIntake(String intake) {
        this.intake = intake;
    }

    public String getTuitionMin() {
        return tuitionMin;
    }

    public void setTuitionMin(String tuitionMin) {
        this.tuitionMin = tuitionMin;
    }

    public String getTuitionMax() {
        return tuitionMax;
    }

    public void setTuitionMax(String tuitionMax) {
        this.tuitionMax = tuitionMax;
    }

    public String getPage() {
        return page;
    }

    public void setPage(String page) {
        this.page = page;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }
}
