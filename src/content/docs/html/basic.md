---
title: HTML - Basic
---

# HTML - Basic Concepts

HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications. It describes the structure of a web page semantically and originally included cues for the appearance of the document.

## Key Topics

### What is HTML?
HyperText Markup Language. It's the backbone of most web pages. "HyperText" refers to links that connect web pages to one another, either within a single website or between websites. "Markup Language" means you use HTML to simply "mark up" a text document with tags that tell a web browser how to structure it for display.

### Basic Document Structure
Every HTML document follows a basic structure:
- **`<!DOCTYPE html>`**: This declaration defines that the document is an HTML5 document. It's crucial for browsers to render the page in standards mode.
- **`<html>`**: The root element of an HTML page. The `lang` attribute (e.g., `lang="en"`) is often included to declare the language of the page.
- **`<head>`**: Contains meta-information about the HTML document, which is not displayed on the page itself. This includes the title, character set, styles, links to scripts, and other metadata.
- **`<body>`**: Contains the visible page content (text, images, links, tables, lists, etc.).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
    <link rel="stylesheet" href="style.css"> <!-- Link to an external CSS file -->
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a paragraph on my first web page.</p>
</body>
</html>
```

### Head Elements
Elements inside `<head>` provide information about the document:
- **`<title>`**: Defines the title of the document, shown in the browser's title bar or tab.
- **`<meta>`**: Provides metadata.
    - `charset="UTF-8"`: Specifies the character encoding for the document. UTF-8 is highly recommended.
    - `name="viewport" content="width=device-width, initial-scale=1.0"`: Configures the viewport for responsive web design, making the page adapt to different device screen sizes.
    - Other uses: `description`, `keywords` (less important for SEO now), `author`.
- **`<link>`**: Defines relationships between the current document and an external resource. Most commonly used to link to external CSS stylesheets (`rel="stylesheet" href="path/to/style.css"`).
- **`<style>`**: Used to embed internal CSS styles directly within the HTML document (less common for larger projects than external stylesheets).
- **`<script>`**: Used to embed or link to JavaScript files. Can be in `<head>` (often with `defer` or `async` attributes) or at the end of `<body>`.

### Common Text Elements
These elements structure the textual content of a page:
- **Headings (`<h1>` to `<h6>`)**: Define hierarchical headings, `<h1>` being the most important and `<h6>` the least.
- **Paragraphs (`<p>`)**: Define paragraphs of text.
- **Line breaks (`<br>`)**: Inserts a single line break. Use sparingly; CSS is preferred for spacing.
- **Horizontal rules (`<hr>`)**: Represents a thematic break between paragraph-level elements (e.g., a change of topic).
- **Emphasis (`<em>`, `<strong>`)**:
    - `<em>`: Emphasizes text (typically displayed as italic).
    - `<strong>`: Indicates strong importance, seriousness, or urgency (typically displayed as bold).
- **Inline elements (`<span>`)**: A generic inline container for phrasing content, which does not inherently represent anything. It can be used to group inline elements for styling or scripting.
- **Preformatted text (`<pre>`)**: Defines preformatted text. Text within a `<pre>` element is displayed in a fixed-width font (usually Courier) and preserves both spaces and line breaks.
- **Code (`<code>`)**: Defines a piece of computer code. Typically displayed in a monospace font.

```html
<h1>Main Title</h1>
<p>This is a paragraph with <em>emphasized</em> text and <strong>strongly important</strong> text.</p>
<p>Another paragraph.<br>This is on a new line due to br.</p>
<hr>
<pre>
  function greet() {
    console.log("Hello");
  }
</pre>
<p>The HTML tag for code is <code>&lt;code&gt;</code>.</p>
```

### Lists
HTML offers several types of lists:
- **Unordered lists (`<ul>`, `<li>`)**: A list of items where the order does not matter. Items are typically marked with bullets.
    - `<ul>`: The container for the unordered list.
    - `<li>`: Represents a list item.
- **Ordered lists (`<ol>`, `<li>`)**: A list of items where the order is important. Items are typically marked with numbers or letters.
    - `<ol>`: The container for the ordered list.
    - `<li>`: Represents a list item.
- **Description lists (`<dl>`, `<dt>`, `<dd>`)**: A list of terms and their descriptions.
    - `<dl>`: The description list container.
    - `<dt>`: Defines a term/name.
    - `<dd>`: Describes each term/name.

```html
<ul>
    <li>Coffee</li>
    <li>Tea</li>
    <li>Milk</li>
</ul>

<ol>
    <li>Gather ingredients</li>
    <li>Mix ingredients</li>
    <li>Bake</li>
</ol>

<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language</dd>
    <dt>CSS</dt>
    <dd>Cascading Style Sheets</dd>
</dl>
```

### Links
The `<a>` (anchor) element creates hyperlinks to other web pages, files, locations within the same page, or email addresses.
- **`href` attribute**: Specifies the URL of the page the link goes to.
- **`target` attribute**: Specifies where to open the linked document.
    - `_blank`: Opens the linked document in a new window or tab.
    - `_self`: Opens the linked document in the same frame as it was clicked (default).

```html
<a href="https://www.example.com">Visit Example.com</a>
<a href="about.html">About Us</a>
<a href="https://www.example.com" target="_blank">Example in new tab</a>
<a href="#section1">Jump to Section 1</a> <!-- Internal page link -->
<a href="mailto:info@example.com">Email Us</a>
```

### Images
The `<img>` element embeds an image into the page. It's an empty element (no closing tag).
- **`src` attribute**: Specifies the path (URL) to the image. (Required)
- **`alt` attribute**: Provides alternative text for the image. This text is displayed if the image cannot be loaded and is crucial for accessibility (e.g., for screen readers). (Required for accessibility)
- **`width` and `height` attributes**: Specify the dimensions of the image in pixels. While CSS is preferred for sizing, setting these can help the browser reserve space before the image loads, reducing layout shifts.

```html
<img src="images/logo.png" alt="Our Company Logo" width="150" height="75">
<img data-ai-hint="mountain landscape" src="https://picsum.photos/400/200" alt="A random placeholder image of a landscape">
```

### Basic Table Structure
Tables are used to display data in a structured, tabular format.
- **`<table>`**: The container for the table.
- **`<tr>`**: Defines a table row.
- **`<th>`**: Defines a table header cell. Text in `<th>` is typically bold and centered.
- **`<td>`**: Defines a standard table data cell.

```html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>Alice</td>
        <td>30</td>
    </tr>
    <tr>
        <td>Bob</td>
        <td>24</td>
    </tr>
</table>
```

### Comments
HTML comments are not displayed in the browser but can help document your HTML source code.
```html
<!-- This is a comment -->
<p>This text is visible.</p>
<!-- 
    This is a
    multi-line comment.
-->
```

### HTML Attributes
Attributes provide additional information about HTML elements. They are always specified in the start tag and usually come in name/value pairs like `name="value"`.
- **Global attributes**: Can be used on any HTML element.
    - `id`: Specifies a unique id for an element (must be unique within the entire document).
    - `class`: Specifies one or more class names for an element (used by CSS and JavaScript).
    - `style`: Used to apply inline CSS styles to an element (generally discouraged in favor of external or internal stylesheets).
    - `title`: Specifies extra information about an element, often shown as a tooltip.
    - `lang`: Specifies the language of the element's content.
    - `dir`: Specifies the text direction of the element's content (`ltr` or `rtl`).

```html
<p id="intro-paragraph" class="highlight important" title="This is an important paragraph.">
    Some text.
</p>
```

### Semantic vs. Non-semantic elements (Brief Introduction)
- **Semantic elements**: Clearly describe their meaning to both the browser and the developer (e.g., `<article>`, `<footer>`, `<nav>`). They help improve accessibility and SEO.
- **Non-semantic elements**: Tell nothing about their content (e.g., `<div>`, `<span>`). They are often used as containers for styling or grouping.

Using semantic elements where appropriate leads to more meaningful and well-structured HTML.
