package com.banca.dto;

public record LoginResponse(
        String token,
        Long userId,
        String username,
        String nombres,
        String apellidos,
        String rol
) {}
