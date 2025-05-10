---
title: HTML Indian Flag
description: Placeholder content for HTML Indian Flag.
order: 3
---

# HTML Indian Flag

# Drawing the Indian Flag with HTML and CSS

To draw the Indian flag using HTML and CSS, you can follow these steps:

1. Create a new HTML file and add the basic structure.
2. Use CSS to style the flag components.

Here is an example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indian Flag with CSS</title>
    <style>
        /* Flag Container */
        .flag {
            width: 300px;
            height: 180px;
            border: 1px solid #000;
            display: flex;
            flex-direction: column;
        }

        /* Saffron, White, Green Stripes */
        .stripe {
            flex: 1;
            width: 100%;
        }

        .saffron {
            background-color: #FF9933;
        }

        .white {
            background-color: #FFFFFF;
            position: relative;
        }

        .green {
            background-color: #138808;
        }

        /* Ashoka Chakra */
        .chakra {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid #000080;
        }

        /* Chakra Spokes */
        .chakra .spoke {
            position: absolute;
            width: 1px;
            height: 24px; /* Reduced height to fit inside the chakra */
            background-color: #000080;
            top: 1px; /* Adjusted to position spokes within the Chakra */
            left: 50%;
            transform-origin: center bottom;
        }

        /* Creating 24 spokes */
        /* Each spoke is rotated by 15 degrees (360/24 = 15) */
        .chakra .spoke:nth-child(1)  { transform: rotate(0deg); }
        .chakra .spoke:nth-child(2)  { transform: rotate(15deg); }
        .chakra .spoke:nth-child(3)  { transform: rotate(30deg); }
        .chakra .spoke:nth-child(4)  { transform: rotate(45deg); }
        .chakra .spoke:nth-child(5)  { transform: rotate(60deg); }
        .chakra .spoke:nth-child(6)  { transform: rotate(75deg); }
        .chakra .spoke:nth-child(7)  { transform: rotate(90deg); }
        .chakra .spoke:nth-child(8)  { transform: rotate(105deg); }
        .chakra .spoke:nth-child(9)  { transform: rotate(120deg); }
        .chakra .spoke:nth-child(10) { transform: rotate(135deg); }
        .chakra .spoke:nth-child(11) { transform: rotate(150deg); }
        .chakra .spoke:nth-child(12) { transform: rotate(165deg); }
        .chakra .spoke:nth-child(13) { transform: rotate(180deg); }
        .chakra .spoke:nth-child(14) { transform: rotate(195deg); }
        .chakra .spoke:nth-child(15) { transform: rotate(210deg); }
        .chakra .spoke:nth-child(16) { transform: rotate(225deg); }
        .chakra .spoke:nth-child(17) { transform: rotate(240deg); }
        .chakra .spoke:nth-child(18) { transform: rotate(255deg); }
        .chakra .spoke:nth-child(19) { transform: rotate(270deg); }
        .chakra .spoke:nth-child(20) { transform: rotate(285deg); }
        .chakra .spoke:nth-child(21) { transform: rotate(300deg); }
        .chakra .spoke:nth-child(22) { transform: rotate(315deg); }
        .chakra .spoke:nth-child(23) { transform: rotate(330deg); }
        .chakra .spoke:nth-child(24) { transform: rotate(345deg); }
    </style>
</head>
<body>
    <div class="flag">
        <div class="stripe saffron"></div>
        <div class="stripe white">
            <div class="chakra">
                <!-- Create 24 spokes for the Ashoka Chakra -->
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
                <div class="spoke"></div>
            </div>
        </div>
        <div class="stripe green"></div>
    </div>
</body>
</html>
```

This code creates a simple representation of the Indian flag using HTML and CSS. The flag is divided into three horizontal sections: saffron, white, and green. The Ashoka Chakra is represented by a blue circle in the center of the white section.