# yelp scraper

this scraper scrapes the search result of restaurants of miami city from yelp and then
go to each restaurant then scrapes the following data.

- name
- url
- type
- address]
- reviews
- rating

## Run Locally

To run the script successfully you need 3 things:

- google service account email
- private key
- google sheet id.
  To get key and email (follow [this](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication) documentation for service account).  
  google sheet id is random string in url of google sheet where you want to store data.

Clone the project

```bash
  git clone https://github.com/kashif-ghafoor/yelp-scraper.git
```

Setup environement variables.

- rename the .env_sample to .env
- replace the <your email> and <your key> in .env file with email and private key you copied from json file.
- replace the google sheet id in third line of .env file with <your id>.

Note: you have to explicitly give google sheet access to the email you created.

Go to the project directory

```bash
  cd yelp-scraper
```

Install dependencies

```bash
  npm install
```

Start the script

```bash
  npm run start
```

wait for the script to complete you will see data in your google sheets.

Alternatively you can run it in codespaces.  
rename .env_sample to .env  
put the required data in .env 
npm run start
tadah...
