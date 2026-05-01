package br.com.catalog.api.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<Map<String, Object>> handleCredenciaisInvalidas(CredenciaisInvalidasException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(ContaBloqueadaException.class)
    public ResponseEntity<Map<String, Object>> handleContaBloqueada(ContaBloqueadaException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, Object>> handleAcessoNegado(AcessoNegadoException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<Map<String, Object>> handleEmailJaCadastrado(EmailJaCadastradoException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(CodigoRecuperacaoInvalidoException.class)
    public ResponseEntity<Map<String, Object>> handleCodigoInvalido(CodigoRecuperacaoInvalidoException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ProdutoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleProdutoNaoEncontrado(ProdutoNaoEncontradoException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> handleCategoriaNaoEncontrada(CategoriaNaoEncontradaException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Erro de validação");
        return buildResponse(HttpStatus.BAD_REQUEST, mensagem);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String mensagem) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("erro", status.getReasonPhrase());
        body.put("mensagem", mensagem);
        return ResponseEntity.status(status).body(body);
    }
}
