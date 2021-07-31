install docker docker-compose and use traefik for maximum convenience

git clone https://git.y.gy/firstdorsal/wkd-auto-docker
cd wkd-auto-docker
mkdir public-keys

create a file with the name of your key id (for example: paul@example.com) and insert your public key
get the public key:
thunderbird > extras > manage OpenPGP keys > right click the key > copy public key
cmd line > gpg -a --export paul@example.com > paul@example.com

docker-compose up -d --build

thanks @www.kuketz-blog.de
https://www.kuketz-blog.de/gnupg-web-key-directory-wkd-einrichten/