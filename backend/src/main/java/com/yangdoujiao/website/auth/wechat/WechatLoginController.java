package com.yangdoujiao.website.auth.wechat;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.api.AuthSessionResponse;
import com.yangdoujiao.website.common.web.ClientAddressResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/auth/wechat")
public class WechatLoginController {
    private final WechatLoginService login;
    private final WechatBindingService binding;
    private final ClientAddressResolver addresses;

    public WechatLoginController(WechatLoginService login, WechatBindingService binding,
            ClientAddressResolver addresses) {
        this.login = login;
        this.binding = binding;
        this.addresses = addresses;
    }

    @GetMapping("/start")
    public ResponseEntity<Void> start(@RequestParam(defaultValue = "zh") String locale,
            @RequestParam(required = false) String returnTo, HttpServletRequest request) {
        URI location = login.start(locale, returnTo, addresses.resolve(request), request);
        return ResponseEntity.status(302).location(location).build();
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam(required = false) String code,
            @RequestParam(required = false) String state, @RequestParam(required = false, name = "error") String error,
            HttpServletRequest request, HttpServletResponse response) {
        URI location = login.callback(code, state, error, addresses.resolve(request), request, response);
        return ResponseEntity.status(302).location(location).build();
    }

    @PostMapping("/bind")
    public AuthSessionResponse bind(@RequestBody BindWechatAccountRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        return binding.bind(body, addresses.resolve(request), request, response);
    }
}
