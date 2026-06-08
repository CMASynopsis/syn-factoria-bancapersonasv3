package com.banca.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TransferenciaOtroBancoRequest(
        @NotNull Long cuentaOrigenId,
        @NotBlank @Size(min = 20, max = 20) String cciDestino,
        @NotBlank String titularDestino,
        @NotBlank String bancoDestino,
        @NotNull @DecimalMin("0.01") BigDecimal monto,
        String glosa
) {}
