import csv

# Replace this with your actual data
data = [
    ['Name', 'Text'],
    ['محمد', 'هذا نص عربي'],
    ['John', 'This is English text']
]

# Specify your file path
file_path = 'authors.csv'

# Open the file with 'utf-8-sig' encoding to include the BOM
with open(file_path, mode='w', encoding='utf-8-sig', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(data)

print(f'CSV file saved with UTF-8 BOM at {file_path}')