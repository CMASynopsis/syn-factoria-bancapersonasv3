package com.banca.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransferenciaMismoBancoRequest(
        @NotNull Long cuentaOrigenId,
        @NotBlank String numeroCuentaDestino,
        @NotNull @DecimalMin("0.01") BigDecimal monto,
        String glosa
) {}
