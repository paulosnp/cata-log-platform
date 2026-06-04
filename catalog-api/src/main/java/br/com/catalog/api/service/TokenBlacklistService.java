package br.com.catalog.api.service;

import br.com.catalog.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "bl:";

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtService jwtService;

    public void blacklist(String token) {
        long ttlMillis = jwtService.getRemainingExpirationMillis(token);
        if (ttlMillis <= 0) return;
        redisTemplate.opsForValue()
                .set(BLACKLIST_PREFIX + token, "1", ttlMillis, TimeUnit.MILLISECONDS);
    }

    public boolean isBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
        } catch (Exception e) {
            return false;
        }
    }
}
