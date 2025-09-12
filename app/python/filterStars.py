import json

with open("app/public/BSC.json", "r") as f:
    stars = json.load(f)

filtered_stars = [
    star for star in stars
    if float(star["MAG"]) >= 4.0
]

with open("app/public/BSC_filtered.json", "w") as f:
    json.dump(filtered_stars, f, indent=4)

