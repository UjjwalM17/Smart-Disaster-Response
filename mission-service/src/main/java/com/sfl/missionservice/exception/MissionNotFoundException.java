package com.sfl.missionservice.exception;

public class MissionNotFoundException extends RuntimeException {

    public MissionNotFoundException(String message) {
        super(message);
    }
}