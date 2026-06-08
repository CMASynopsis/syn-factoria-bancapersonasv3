package com.banca.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransferenciaPropiaRequest(
        @NotNull Long cuentaOrigenId,
        @NotNull Long cuentaDestinoId,
        @NotNull @DecimalMin("0.01") BigDecimal monto,
        String glosa
) {}
