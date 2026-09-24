package com.yangdoujiao.website.auth.account;

import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class AccountIdentifierNormalizer {
    private static final Pattern PHONE = Pattern.compile("^\\+[1-9][0-9]{7,14}$");
    private static final Pattern LOCAL_PART = Pattern.compile("[\\p{L}\\p{N}!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\p{L}\\p{N}!#$%&'*+/=?^_`{|}~-]+)*");
    private static final Pattern DOMAIN_LABEL = Pattern.compile("[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]{0,61}[\\p{L}\\p{N}])?");

    public NormalizedIdentifier normalizeLogin(String raw) {
        if (raw == null) throw new AuthValidationException();
        if (!raw.contains("@")) {
            if (!PHONE.matcher(raw).matches()) throw new AuthValidationException();
            return new NormalizedIdentifier(AccountIdentifierType.PHONE, raw);
        }
        String email = stripOuterWhitespace(raw).toLowerCase(Locale.ROOT);
        if (email.length() > 254 || email.codePoints().anyMatch(Character::isISOControl)) {
            throw new AuthValidationException();
        }
        int at = email.indexOf('@');
        if (at < 1 || at != email.lastIndexOf('@')) throw new AuthValidationException();
        String local = email.substring(0, at);
        String domain = email.substring(at + 1);
        if (local.length() > 64 || !LOCAL_PART.matcher(local).matches() || domain.length() > 253) {
            throw new AuthValidationException();
        }
        String[] labels = domain.split("\\.", -1);
        if (labels.length < 2) throw new AuthValidationException();
        for (String label : labels) {
            if (label.length() > 63 || !DOMAIN_LABEL.matcher(label).matches()) throw new AuthValidationException();
        }
        return new NormalizedIdentifier(AccountIdentifierType.EMAIL, email);
    }

    private String stripOuterWhitespace(String value) {
        int start = 0;
        int end = value.length();
        while (start < end && isWhitespace(value.codePointAt(start))) start += Character.charCount(value.codePointAt(start));
        while (start < end && isWhitespace(value.codePointBefore(end))) end -= Character.charCount(value.codePointBefore(end));
        return value.substring(start, end);
    }

    private boolean isWhitespace(int codePoint) {
        return Character.isWhitespace(codePoint) || Character.isSpaceChar(codePoint);
    }
}
