/*

pm2 start "node onout.js"

*/
//load GHKEY from .env

console.log(process.argv[2])
if (!process.argv[2]) {
  return console.log('GHKEY not found');
}


const express = require('express');


const { body, validationResult } = require('express-validator');
const fs = require('fs');
const request = require('request');

const { htmlEncode } = require('js-htmlencode');

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


const regex = new RegExp(`<div className="text-center text-4xl font-bold text-black dark:text-white">
              (.*?)
            </div>`, 'gm')




let filenam = 'components/Chat/Chat.tsx';


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
    }
  });
  res.send(`<meta name="viewport" content="width=device-width, initial-scale=1">
    <form method="post"  action="/submit-form">
	Main text <br>
      <textarea style='width:500px;height:300px' required name='main_text'></textarea>
      <br>

      <input type='submit' value='deploy test' style='size:30px'>
	  <input type='button' onclick='alert("contact us")' value='deploy to my domain' style='size:30px'>
    </form>
  `);
});

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



        fs.readFile(filenam, 'utf8', function (err, data) {
          if (err) {
            console.error(err);
            return;
          }

          const str_new = `<div className="text-center text-4xl font-bold text-black dark:text-white">
        ${main_text}
      </div>`;

          const updatedData = data.replace(regex, str_new); //это строка для замены прямо в файле

          fs.writeFile(`${filenam}`, updatedData, 'utf8', function (err) {
            if (err) {
              console.error(err);
              return;
            }
            console.log('File updated successfully');
          });
        });

        //load ghkey from .env



        exec(
          `git commit -a -m "replace chat welcome screen" && git push https://${process.argv[2]}@github.com/marsiandeployer/${reponame}.git && git checkout main`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`84: ${error}`);
              return res.status(400).json({
                error: '156',
              });
            }
            console.log(stdout);
            res.send(
              `Success. Your app will be availabe at https://chate-git-${nm}-marsiandeployer.vercel.app/ in few minutes. Enjoy :) Plesae note if you send form again domain will be changed`,
            );
          },
        );
      },
    );
  },
);

app.listen(3010, () => {
  console.log('Server running on port 3010');
});