package com.yangdoujiao.website.auth.session;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;

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
    private final Set<UserAccountRole> permissions;
    private String passwordHash;

    private UserPrincipal(long userId, String fullName, String email, String phone, String passwordHash,
            UserAccountRole role, Set<UserAccountRole> permissions) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.role = role;
        this.permissions = permissions;
    }

    public static UserPrincipal from(UserAccount account) {
        return new UserPrincipal(account.getId(), account.getFullName(), account.getNormalizedEmail(),
                account.getNormalizedPhone(), account.getPasswordHash(), account.getRole(),
                java.util.stream.Stream.of(UserAccountRole.ADMIN, UserAccountRole.ADVISER)
                    .filter(account::hasPermission).collect(java.util.stream.Collectors.toUnmodifiableSet()));
    }

    public long userId() { return userId; }
    public String fullName() { return fullName; }
    public String email() { return email; }
    public String phone() { return phone; }

    private boolean hasPermission(UserAccountRole permission) {
        // Existing serialized sessions have no permissions field; live API checks still verify DB grants.
        return permissions == null ? role == permission : permissions.contains(permission);
    }
    public boolean isAdviser() { return hasPermission(UserAccountRole.ADVISER); }
    public boolean isAdmin() { return hasPermission(UserAccountRole.ADMIN); }

    @Override
    public String getUsername() { return "user:" + userId; }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public void eraseCredentials() { passwordHash = null; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        var authorities = new ArrayList<GrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (isAdviser()) authorities.add(new SimpleGrantedAuthority("ROLE_ADVISER"));
        if (isAdmin()) authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return List.copyOf(authorities);
    }
}
