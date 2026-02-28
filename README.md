# Dawn Design System (DS3) Tokens

Welcome to the official repository for the Dawn Design System (DS3) tokens. This repository is the single source of truth for all design tokens, bridging the gap between design and development.

## 🎨 What are Design Tokens?

Design tokens are the visual atoms of our design system—think of them as variables for design properties like colors, typography, spacing, and more. Instead of hard-coding values like `#3D3E9F` for our primary brand color, we use a token, like `color.brand.primary.500`.

This approach allows us to maintain a consistent and scalable visual language across all our products. When a token's value is updated, the change is automatically propagated to all designs and codebases that use it.

## ⚙️ How It Works

Our design tokens are managed in Figma using the **Tokens Studio** plugin. This allows designers to have full control over the visual language of our products.

The token system is structured in three layers:

1.  **Core Tokens (`core.json`):** These are the foundational values of our design system. They are context-agnostic and represent the raw, primitive values of our color palette, font families, and sizes.

2.  **Semantic Tokens (`semantic.json`):** This layer gives meaning to our core tokens. For example, a semantic token might define the `color.action.brand.background.default` to be `color.brand.primary.500`. This allows us to make design decisions based on the *purpose* of a color, rather than its specific hex code.

3.  **Component Tokens (`component.json`):** These tokens are specific to individual UI components. They define the visual properties of components like buttons, tags, and badges by referencing semantic tokens.

When designers make changes in Figma, they can push their updates directly to this repository. This triggers a process that automatically transforms the token files into code that can be used by developers in our Android and iOS apps.

## ✨ For Designers: Your Workflow

As a designer, you'll primarily interact with Figma and Tokens Studio. Here's a quick overview of the workflow:

1.  **Create your own source of truth:** Make sure you have a templated version of the original design system repo in GitHub to use as source of truth override.
2.  **Open Figma:** Open your Figma design file.
3.  **Connect to DS3 library:** If it isn’t already; make sure your file is connected to the DS3 component library in Figma.
4.  **Launch Tokens Studio:** Open the Tokens Studio plugin.
5.  **Connect to GitHub:** If you haven’t already; Connect or Apply your GitHub repo as Sync Provider in Tokens Studio settings.
6.  **Make Your Changes:** Create, update, or delete tokens as needed.
7.  **Push to GitHub:** Once you’re happy with your changes, use Tokens Studio to create a new branch, commit your changes, and create a pull request.
8.  **Merge Your Changes:** After your pull request is reviewed and approved, your changes will be merged into the main branch, and the magic of automation will take care of the rest!

## 👩‍💻 For Developers: Using the Tokens

Developers can consume the latest design tokens by running a script in their projects. This script downloads the JSON files from this repository and converts them into native code for each platform (e.g., Kotlin for Android, Swift for iOS).

This ensures that the implementation always stays in sync with the latest design specifications, reducing inconsistencies and speeding up the development process.

## 🤝 Questions or Feedback?

If you have any questions, or feedback, or need help with the design system, please reach out to the design system team.
