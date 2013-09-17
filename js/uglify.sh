mkdir min

for file in *.js
do
    uglifyjs "$file" > "min/$file"
    mv "min/$file" "min/${file/.js}.min.js"
done

cp ../*.php ../styles/*.css min
tar -cz min > archive.tar.gz
php emailjs.php
rm -f archive.tar.gz
rm -rf min