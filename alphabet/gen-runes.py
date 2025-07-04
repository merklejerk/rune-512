#!/usr/bin/env python3

# Define the Unicode ranges
ranges = [
    (0x2800, 0x28FF),  # Braille Patterns
    (0x2500, 0x257F),  # Box Drawing
    (0x2580, 0x259F),  # Block Elements
    (0x25A0, 0x25FF),  # Geometric Shapes
]

all_chars = []
for start, end in ranges:
    for codepoint in range(start, end + 1):
        all_chars.append(chr(codepoint))

result = "".join(all_chars)
print(result)
