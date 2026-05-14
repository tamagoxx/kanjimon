with open('src/data/learning/characters.ts', 'r') as f:
    content = f.read()

# Fix the problematic lines by replacing the pattern with escaped quotes
# Line 428: pattern: 'ましょう (mashou) - Let's',
# Need to change to: pattern: "ましょう (mashou) - Let's",

old_line = "    pattern: 'ましょう (mashou) - Let's',"
new_line = '    pattern: "ましょう (mashou) - Let\'s",'

content = content.replace(old_line, new_line)

old_meaning = "    meaning: 'let\\'s [verb]',"
new_meaning = '    meaning: "let\'s [verb]",'

content = content.replace(old_meaning, new_meaning)

with open('src/data/learning/characters.ts', 'w') as f:
    f.write(content)

print("Done")