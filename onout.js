/*
git commit main
node onout.js ghp_FsX...qn (github user key)
DO NOT RUN WITHOUT COMMIT FROM "main" branch (git can delete your unsaved changes)
*/

const PORT = 3020

console.log(process.argv[2])
if (!process.argv[2]) {
  return console.log('GHKEY not found');
}


const express = require('express');


const { body, validationResult } = require('express-validator');
const fs = require('fs');
const request = require('request');

const { htmlEncode } = require('js-htmlencode');
const { IconLetterB } = require('@tabler/icons-react');

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

function esc_attr(str) {
  return htmlEncode(str);
}


let filenam = 'components/Chat/Chat.tsx';
//test regex is it possible to change such file? does it have something to change?
const regex = new RegExp(`          <div className="text-center text-4xl font-bold text-black dark:text-white">
            (.*?)
          </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">.*?</div>
            <div className="mb-2 font-bold">
              .*?
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              .*?
            </div>
            <div className="mb-2">
              .*?
            </div>
            <div className="mb-2">
              (.*?)
            </div>
            <div>
              (.*?)
            </div>
          </div>`, 's')





app.post(
  '/submit-form',
  [body('main_text').notEmpty().withMessage('Please specify main text')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    let main_text = esc_attr(req.body.main_text);

    let api_response;
    let reponame = 'chate';
    //telegram api get bit name by api key

    const { exec } = require('child_process');
    const nm = `i${new Date().getMinutes()}${new Date().getDate()}${new Date().getMonth()}${new Date().getFullYear()}`;
    console.log('nm:' + nm);

    exec(
      `git checkout -b ${nm}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`git checkout -b err: ${error}`);
          return res.status(400).json({
            error: `Failed to checkout. ${error}`,
          });
        }

        console.log(stdout);

        if (req.body.open_ai_key) {
          //open_ai_key key is provided by admin

        }

        fs.readFile(filenam, 'utf8', function (err, data) {
          if (err) {
            console.error(err);
            return;
          }
          let link = '';

          //if request.body.link is not empty
          if (req.body.link) {
            link = `<a href="${esc_attr(req.body.link)}" target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline">${esc_attr(req.body.linkText)}</a>`;
          }
          h1text = esc_attr(req.body.h1text);
          let description = esc_attr(req.body.main_text);
          const str_new = `<div className="text-center text-4xl font-bold text-black dark:text-white">
          ${h1text}
        </div>
        <div className="text-center text-lg text-black dark:text-white">
          <div className="mb-8">${description}</div>
          <div className="mb-2 font-bold">
            
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
         
          <div className="mb-2">
            
          </div>
          <div>
            ${link}
          </div>
        </div>`;

          const updatedData = data.replace(regex, str_new); //это строка для замены прямо в файле

          fs.writeFile(`${filenam}`, updatedData, 'utf8', function (err) {
            if (err) {
              console.error(err);
              return;
            }
            console.log('File updated successfully');
          });


          //load ghkey from .env



          exec(
            `git add . && git commit -a -m "replace chat welcome screen" && git push https://${process.argv[2]}@github.com/marsiandeployer/${reponame}.git && git checkout main`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`84: ${error}`);
                return res.status(400).json({
                  error: '156',
                });
              }
              console.log(stdout);
              res.send(
                `<!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>deploy</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
                    <link rel="stylesheet" href="styles.css">
                  </head>
                  <body>
                  
                  
                    <div class="container col-5">
                    
                    <Br>  <bR><br><br>
                    <div class="alert alert-success" role="alert">
                Success. Your app will be availabe at https://chate-git-${nm}-marsiandeployer.vercel.app/ in <span id='incomeTicker'>60</span>s. Enjoy :) Plesae note if you send form again domain will be changed . 
                <br><Br><br>
                Widget HTML code to embed on your site:
                
                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3">
<!-- iframe with 100% height -->
<iframe style='border:0;min-width:400px;min-height:800px' src="https://chate-git-${nm}-marsiandeployer.vercel.app/" class='' id="onoutiframe" width="100%" height="100%"></iframe>
<!-- fix 100% onoutiframe iframe height on pure js -->
<script>
var iframe = document.getElementById('onoutiframe');
iframe.onload = function() {
iframe.height = iframe.contentWindow.document.body.scrollHeight + 'px';
};
</script></textarea>
                </div>
                </div>
                <script>var incomeTicker = 60;

                window.setInterval(function(){
                 if (incomeTicker > 0)
                   incomeTicker--;
                      document.getElementById("incomeTicker").innerHTML = incomeTicker;
                if (incomeTicker <= 0)
                  incomeTicker = 60;
                }, 1000);
                </script>
                </body>
                </html>
                `,
              );
            },
          );
        });
      },
    );
  },
);


app.get('/', (req, res) => {
  console.log('get /');
  console.log(process.argv[2]);
  fs.readFile(filenam, 'utf8', function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
    //test regex is working
    const matches = data.match(regex);
    console.log(matches);
    if (!matches) {
      return res.status(400).json({
        error: 'Failed to find regex, please contact us (error onout.js missing regex)',
      });
    } else {
      res.send(`
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>deploy</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
  
	
  <div class="container my-5">
  <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
    <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
      
      <form method="post"  action="/submit-form"><br><br>
      1 Main title:<Br>
      <input type='text' name='h1text' placeholder='Welcome!' value='Your welcome message'><Br>
  
        2 Main text <br>
        <textarea style='width:500px;height:300px' required name='main_text'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</textarea>
        <!-- <br>
        OPEN_AI_KEY (leave empty if you plan to sell it externally):<Br>
        <input type='text' name='open_ai_key' value=''><Br>
        -->
        <Br>3 Link where user can get access code:<Br>
        <input type='text' name='link' placeholder='https://www.buymeacoffee.com/onoutorg/e/127423' value='https://www.buymeacoffee.com/onoutorg/e/127423'><Br>
        <Br>
        4 Text for link<Br>
        <input type='text' name='linkText' placeholder='Get API key here' value='Buy access'><Br>
        <Br>
        <input type='submit' class='btn btn-primary' value='deploy test' style='size:30px'>
      <input type='button' class='btn' onclick='alert("contact us")' value='deploy to my domain' style='size:30px'>
      <a href="https://t.me/onoutsupportbot" target=_blank>Support</a>
      </form>
    </div>
    <div class="col-lg-4 p-0 overflow-hidden shadow-lg">
        <img class="rounded-lg-3" src="https://onout.org/Chate/mainimage.png" alt="" width="720">
    </div>
  </div>
</div>

  </body>
</html>
  `);
    }
  });

});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
