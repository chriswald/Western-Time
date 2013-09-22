mkdir min
mkdir min/js
mkdir min/styles
mkdir min/js/mobile

for file in *.js
do
    uglifyjs "$file" > "min/js/${file/.js}.min.js"
done

cd mobile

for file in *.js
do
    uglifyjs "$file" > "../min/js/mobile/${file/.js}.min.js"
done

cd ..

cp ../*.php min/
cp ../styles/*.css min/styles/

tar -cz min > archive.tar.gz
php emailjs.php
rm -f archive.tar.gz
rm -rf min