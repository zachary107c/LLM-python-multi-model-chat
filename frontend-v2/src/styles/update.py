import re

def update_sidebar_colors(content):
    themes = re.findall(r'(\.theme-.*? \{.*?\})', content, re.DOTALL)

    updated_content = content
    for theme in themes:
        sidebar_block = theme
        # Extract color values from the main colors
        color_values = {
            'background': re.search(r'--background: (.*?);', theme).group(1),
            'foreground': re.search(r'--foreground: (.*?);', theme).group(1),
            'primary': re.search(r'--primary: (.*?);', theme).group(1),
            'primary-foreground': re.search(r'--primary-foreground: (.*?);', theme).group(1),
            'accent': re.search(r'--accent: (.*?);', theme).group(1),
            'accent-foreground': re.search(r'--accent-foreground: (.*?);', theme).group(1),
            'border': re.search(r'--border: (.*?);', theme).group(1),
            'ring': re.search(r'--ring: (.*?);', theme).group(1)
        }

        # Update the sidebar colors
        for key, value in color_values.items():
            sidebar_block = re.sub(rf'--sidebar-{key}: .*?;', f'--sidebar-{key}: {value};', sidebar_block)

        updated_content = updated_content.replace(theme, sidebar_block)

    return updated_content

def main():
    # File path
    file_path = 'index.css'
    save_path = 'index-v2.css'
    
    # Read the CSS file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Update sidebar colors
    updated_content = update_sidebar_colors(content)

    # Write the updated content back to the file
    with open(save_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)

    print("Sidebar colors updated successfully.")

if __name__ == '__main__':
    main()