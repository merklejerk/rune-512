#!/usr/bin/env python3
"""
Script to extract Basic_Emoji sequences from emojis-14.0.txt and generate 
a complete list of emoji characters, removing duplicates and filtering out
modifier bases.
"""

import re
from pathlib import Path


def parse_code_points(code_point_str, is_modifier_base=False):
    """Parse code point string and return list of Unicode characters.
    
    Args:
        code_point_str: String like "1F004" or "231A..231B"
        is_modifier_base: If True, only return the first code point as a character
        
    Returns:
        List of Unicode characters
    """
    emojis = []
    
    if '..' in code_point_str:
        # Handle range like "231A..231B"
        start_hex, end_hex = code_point_str.split('..')
        start_code = int(start_hex, 16)
        end_code = int(end_hex, 16)
        
        for code in range(start_code, end_code + 1):
            emojis.append(chr(code))
    else:
        # Handle individual code points, could be space-separated
        code_points = code_point_str.split()
        if is_modifier_base:
            # For modifier sequences, we only want the base emoji
            if code_points:
                emojis.append(chr(int(code_points[0], 16)))
        else:
            chars = []
            for code_point in code_points:
                chars.append(chr(int(code_point, 16)))
            # Join multiple code points into a single emoji sequence
            emojis.append(''.join(chars))
    
    return emojis


def extract_emojis(input_file):
    """Extract Basic_Emoji and RGI_Emoji_Modifier_Sequence bases from the input file.
    
    Args:
        input_file: Path to the emoji data file
        
    Returns:
        A tuple containing:
        - A set of unique Basic_Emoji characters
        - A set of unique base emoji characters from modifier sequences
    """
    basic_emojis = set()
    modifier_bases = set()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse the line format: code_point(s) ; type_field ; description # comments
            parts = line.split(';')
            if len(parts) < 2:
                continue
            
            code_point_str = parts[0].strip()
            type_field = parts[1].strip()
            
            try:
                if type_field == 'Basic_Emoji':
                    emoji_chars = parse_code_points(code_point_str)
                    basic_emojis.update(emoji_chars)
                elif type_field == 'RGI_Emoji_Modifier_Sequence':
                    # We only want the base emoji from the sequence
                    emoji_chars = parse_code_points(code_point_str, is_modifier_base=True)
                    modifier_bases.update(emoji_chars)
            except ValueError as e:
                print(f"Warning: Could not parse code points '{code_point_str}': {e}")
                continue
    
    return basic_emojis, modifier_bases


def main():
    """Main function to process emoji data and generate output file."""
    input_file = Path(__file__).parent / 'emojis-14.0.txt'
    output_file = Path(__file__).parent / 'alphabet.txt'
    
    if not input_file.exists():
        print(f"Error: Input file '{input_file}' not found")
        return
    
    print(f"Processing emoji data from '{input_file}'...")
    
    # Extract all Basic_Emoji sequences and modifier bases
    basic_emojis, modifier_bases = extract_emojis(input_file)
    
    # Filter out basic emojis that are used as modifier bases
    filtered_emojis = basic_emojis - modifier_bases
    
    # Sort emojis for consistent output (by Unicode code point)
    sorted_emojis = sorted(filtered_emojis, key=lambda x: ord(x[0]) if x else 0)
    # Take the first 1024.
    sorted_emojis = sorted_emojis[:1024]
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        for emoji in sorted_emojis:
            f.write(emoji + '\n')
    
    print(f"Successfully extracted {len(sorted_emojis)} unique Basic_Emoji characters (after filtering)")
    print(f"Output written to '{output_file}'")
    
    # Display first few emojis as a preview
    print("\nFirst 20 emojis:")
    for i, emoji in enumerate(sorted_emojis[:20]):
        print(f"{emoji} ", end="")
        if (i + 1) % 10 == 0:
            print()  # New line every 10 emojis
    print("\n...")


if __name__ == '__main__':
    main()