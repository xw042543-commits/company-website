package com.yangdoujiao.website.auth.session;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;

public final class UserPrincipal implements UserDetails, CredentialsContainer, Serializable {
    @Serial private static final long serialVersionUID = 1L;
    private final long userId;
    private final String fullName;
    private final String email;
    private final String phone;
    private final UserAccountRole role;
    private String passwordHash;

    private UserPrincipal(long userId, String fullName, String email, String phone, String passwordHash,
            UserAccountRole role) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public static UserPrincipal from(UserAccount account) {
        return new UserPrincipal(account.getId(), account.getFullName(), account.getNormalizedEmail(),
                account.getNormalizedPhone(), account.getPasswordHash(), account.getRole());
    }

    public long userId() { return userId; }
    public String fullName() { return fullName; }
    public String email() { return email; }
    public String phone() { return phone; }

    public boolean isAdviser() { return role == UserAccountRole.ADVISER; }

    @Override
    public String getUsername() { return "user:" + userId; }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public void eraseCredentials() { passwordHash = null; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (isAdviser()) {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_ADVISER"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
