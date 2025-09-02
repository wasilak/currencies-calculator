// eslint.config.js
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const config = [
    {
        // Define ignores globally
        ignores: ["web/assets/**/*.{js,jsx,ts,tsx}"],
    },
    {
        files: ["web/src/**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true, // Enable JSX parsing
                },
            },
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                process: "readonly",
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
                exports: "readonly",
                localStorage: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                fetch: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                React: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": typescript,
            react: react,
            "react-hooks": reactHooks,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-empty-object-type": "off",
            "react/react-in-jsx-scope": "off",
            "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
            "no-undef": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];

export default config;
