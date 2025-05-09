---
title: CSS - Basic
---

# CSS - Basic Concepts

CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of a document written in a markup language like HTML. CSS describes how HTML elements should be rendered on screen, on paper, or in other media.

## Key Topics

### What is CSS?
CSS stands for Cascading Style Sheets.
- **Cascading**: Refers to the way styles are applied in a "cascade." Styles can come from multiple sources (browser defaults, user stylesheets, author stylesheets), and CSS has rules (specificity, inheritance, order of declaration) to determine which style applies if there are conflicts.
- **Style Sheets**: CSS rules are typically grouped together in "stylesheets" which are then linked to or embedded in HTML documents.

### Ways to Apply CSS
There are three primary ways to add CSS to an HTML document:

1.  **Inline Styles (style attribute)**:
    Apply styles directly to an HTML element using the `style` attribute. This method has the highest specificity but is generally discouraged for large-scale styling as it makes maintenance difficult and mixes content with presentation.
    ```html
    <p style="color: blue; font-size: 16px;">This paragraph is styled inline.</p>
    ```

2.  **Internal Stylesheets (`<style>` tag in `<head>`)**:
    Define CSS rules within a `<style>` tag in the `<head>` section of an HTML document. Useful for single-page styling or small websites.
    ```html
    <head>
        <title>My Page</title>
        <style>
            p {
                color: green;
                font-family: Arial, sans-serif;
            }
            h1 {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <h1>A Centered Heading</h1>
        <p>This paragraph will be green and use Arial font.</p>
    </body>
    ```

3.  **External Stylesheets (`<link rel="stylesheet">`)**:
    Store CSS rules in a separate `.css` file (e.g., `styles.css`) and link it to the HTML document using the `<link>` tag in the `<head>` section. This is the most common and recommended method for organizing styles, especially for multi-page websites, as it allows for reusability and easier maintenance.
    ```html
    <!-- In index.html -->
    <head>
        <title>My Website</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    ```
    ```css
    /* In styles.css */
    body {
        background-color: #f0f0f0;
    }
    p {
        color: navy;
        line-height: 1.6;
    }
    ```

### Basic Selectors
Selectors are patterns that select HTML elements you want to style.
- **Type selectors (Element selectors)**: Select elements by their tag name.
  ```css
  p { color: black; } /* Selects all <p> elements */
  h1 { font-size: 2em; } /* Selects all <h1> elements */
  ```
- **Class selectors**: Select elements with a specific `class` attribute. Preceded by a period (`.`).
  ```css
  .highlight { background-color: yellow; } /* Selects all elements with class="highlight" */
  .error-text { color: red; font-weight: bold; }
  ```
  ```html
  <p class="highlight">This text is highlighted.</p>
  <span class="error-text">An error occurred.</span>
  ```
- **ID selectors**: Select a single element with a specific `id` attribute. Preceded by a hash (`#`). IDs must be unique within a page.
  ```css
  #main-header { border-bottom: 1px solid gray; } /* Selects the element with id="main-header" */
  ```
  ```html
  <header id="main-header">...</header>
  ```
- **Universal selector (`*`)**: Selects all elements on the page. Often used for resets or global defaults.
  ```css
  * { box-sizing: border-box; } /* Applies border-box to all elements */
  ```
- **Attribute selectors**: Select elements based on the presence or value of an attribute.
  ```css
  a[target="_blank"] { color: newwindowblue; } /* Selects <a> tags with target="_blank" */
  input[type="text"] { border: 1px solid #ccc; } /* Selects text input fields */
  [data-module="login"] { padding: 10px; } /* Selects elements with data-module="login" */
  ```
- **Grouping selectors**: Apply the same styles to multiple selectors by separating them with a comma.
  ```css
  h1, h2, h3 {
      font-family: 'Georgia', serif;
      color: #333;
  }
  ```

### Common CSS Properties
Properties define how selected elements should look or behave.
- **Color and Background**:
    - `color`: Sets the color of the text.
    - `background-color`: Sets the background color of an element.
    - `background-image`: Sets a background image for an element (e.g., `url('image.jpg')`).
- **Typography**:
    - `font-family`: Specifies the font for text (e.g., `Arial, sans-serif`).
    - `font-size`: Sets the size of the text (e.g., `16px`, `1.2em`, `100%`).
    - `font-weight`: Sets the boldness of the text (e.g., `normal`, `bold`, `700`).
    - `text-align`: Aligns text horizontally (e.g., `left`, `right`, `center`, `justify`).
    - `line-height`: Specifies the height of a line of text.
- **Box Model**: Every HTML element is essentially a box. The box model describes how these boxes are sized and spaced.
    - `width`: Sets the width of an element.
    - `height`: Sets the height of an element.
    - `padding`: Space between the content and the border (inside the border).
    - `border`: A line around the padding and content.
    - `margin`: Space outside the border, clearing an area around the element.
- **Basic Layout**:
    - `display`: Specifies the display behavior of an element.
        - `block`: Element starts on a new line and takes up the full width available.
        - `inline`: Element does not start on a new line and only takes up as much width as necessary.
        - `inline-block`: Like inline, but allows setting `width` and `height`.
        - `none`: Element is completely removed from the page layout.

```css
p.intro {
    color: #333333; /* Dark gray text */
    background-color: #f8f8f8; /* Light gray background */
    font-family: Verdana, sans-serif;
    font-size: 14px;
    font-weight: normal;
    text-align: left;
    line-height: 1.5;
    width: 80%;
    padding: 15px;
    border: 1px solid #dddddd;
    margin: 10px auto; /* 10px top/bottom, auto left/right for centering */
    display: block;
}
```

### Units
CSS uses various units to specify lengths, sizes, and other values.
- **Absolute Units**: Fixed and will appear as exactly that size.
    - `px`: Pixels; relative to the viewing device.
- **Relative Units**: Relative to another length property.
    - `em`: Relative to the font-size of the element (e.g., `2em` means 2 times the size of the current font).
    - `rem`: Relative to the font-size of the root (`<html>`) element. Often preferred for creating scalable layouts.
    - `%`: Relative to the parent element's property value.
    - `vw`: Relative to 1% of the width of the viewport.
    - `vh`: Relative to 1% of the height of the viewport.

```css
.container {
    width: 80%; /* 80% of the parent's width */
    font-size: 16px;
}
.container p {
    font-size: 1rem; /* Equivalent to the root font size (e.g., 16px) */
    line-height: 1.5em; /* 1.5 times the font size of the <p> element itself */
    padding: 5vw; /* 5% of the viewport width */
}
```

### Specificity and Cascade
- **Cascade**: CSS rules "cascade" down from multiple sources. The order is generally:
    1. Browser default stylesheets
    2. User stylesheets (if the user has defined custom styles in their browser)
    3. Author stylesheets (external, internal, inline)
    4. Author `!important` declarations
    5. User `!important` declarations
    6. Browser `!important` declarations
- **Specificity**: If multiple CSS rules target the same element and property, the browser uses specificity to decide which rule applies. More specific selectors override less specific ones.
    - Inline styles (highest specificity)
    - ID selectors (e.g., `#myId`)
    - Class selectors (e.g., `.myClass`), attribute selectors (e.g., `[type="text"]`), pseudo-classes (e.g., `:hover`)
    - Type selectors (e.g., `p`, `div`), pseudo-elements (e.g., `::before`)
    - Universal selector (`*`) and inherited values have the lowest specificity.
- **Order of Declaration**: If two selectors have the same specificity, the rule that appears later in the CSS document (or is linked later) will be applied.

### Comments in CSS
Comments are used to explain your code and are ignored by the browser.
```css
/* This is a single-line comment */
p {
    color: navy; /* Set text color to navy */
}

/*
This is a
multi-line comment.
*/
```

### Inheritance
Some CSS properties, when applied to a parent element, are inherited by its child elements (e.g., `color`, `font-family`). Other properties are not inherited (e.g., `border`, `padding`, `width`). You can explicitly set a property to `inherit` its value from its parent.
```css
body {
    font-family: Arial, sans-serif; /* Children will inherit Arial */
    color: #333; /* Children will inherit this color */
}
div {
    border: 1px solid black; /* Border is not inherited by child <p> tags */
    padding: 10px; /* Padding is not inherited */
}
```
