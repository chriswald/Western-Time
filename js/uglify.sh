mkdir min
mkdir min/img
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

mkdir min/mobile

cp ../*.php min/
cp ../.htaccess min/
cp ../mobile/* min/mobile
cp ../styles/*.css min/styles/
cp ../img/* min/img/

tar -cz min > archive.tar.gz
#php emailjs.php
#rm -f archive.tar.gz
rm -rf min