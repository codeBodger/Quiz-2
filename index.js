const crypto = require('crypto');
const fs = require('fs');

function read(fileName) {
	try { return fs.readFileSync(fileName, 'utf8'); }
	catch (err) { console.error(err); }
}

function getFuncName() {
	return getFuncName.caller.name;
}

function randomKey() {
	console.log(getFuncName());
	
	var out = "";
	for (let i = 0; i < 16; i++)
		out = out + Math.floor(Math.random() *16).toString(16);
	return out;
}

function rmkey(keyHashList, keyHash) {
	console.log(getFuncName());
	
	var out = "";
	for (let i = 0; i < keyHashList.length; i++)
		if (keyHashList[i] != keyHash) out = out + "\n" + keyHashList[i];
	return out;
}

function checkAuth(email, hash) {
	console.log(getFuncName());
	
	var pswdFileHash = read(`${email}_password.hash`);
	if (pswdFileHash == hash) { return true; }

	var dataout = (`${email}_reset_password.hash`).split("\n");
	pswdFileHash = dataout[0];
	var time = dataout[1];
	if (pswdFileHash == hash)
		if (Date.now() <= time)
			return true;
	
	return false;
}

function sha256(toHash) {
	console.log(getFuncName());
	return crypto.createHash('sha256').update(toHash).digest('hex');
}


// Login
function login(email, pswd) {
	console.log(getFuncName());
	
	// if(file_exists("${email}_password.hash")) {
	if (fs.existsSync(`${email}_password.hash`)) {
	// 	$pswdfile = fopen("${email}_password.hash", "r") or die("Unable to open file!");
	// 	$pswdfilehash = fread($pswdfile,filesize("${email}_password.hash"));
	// 	fclose($pswdfile);
		
	// 	$pswdhash = hash("sha256", $pswd);
		var pswdHash = sha256(pswd);
	// 	if ("$pswdhash" == "$pswdfilehash") {
		if (checkAuth(email, pswdHash)) {
	// 		$newKey = hash("sha256", sprintf("%d%d%d%d", rand(), rand(), rand(), rand()));
			var newKey =  sha256(randomKey() + randomKey() + randomKey() + randomKey());
	// 		$newKeyHash = hash("sha256", $newKey);
			var newKeyHash = sha256(newKey);

	// 		$keyHashFile = fopen("${email}_keys.hash", "a") or die("Unable to open file!");
	// 		fwrite($keyHashFile, "\n$newKeyHash");
	// 		fclose($keyHashFile);
			fs.appendFile(
				`${email}_keys.hash`,
				`\n${newKeyHash}`,
				err => { if (err) console.error(err); }
			);
			
	// 		echo $newKey;
			return newKey;
		}
	// 	else { echo "haha"; }
		else { return "haha"; }
	}
	// else { echo "signup"; }
	else {return "signup"; }
}


// Logout
function logout(email, key) {
	console.log(getFuncName());
	
	// if(file_exists("${email}_password.hash")) {
	if (fs.existsSync(`${email}_password.hash`)) {
	// 	$keyHashFile = fopen("${email}_keys.hash", "r") or die("Unable to open file!");
	// 	$keyFileHashList = explode("\n", fread($keyHashFile, filesize("${email}_keys.hash")));
	// 	fclose($keyHashFile);
		var keyFileHashList = read(`${email}_keys.hash`).split("\n");
	
	// 	$keyHash = hash("sha256", $key);
		var keyHash = sha256(key);
	// 	unset($keyFileHashList[array_search($keyHash, $keyFileHashList)]);
		var keyFileHashListStr = rmkey(keyFileHashList, keyHash);
		
	// 	$keyHashFile = fopen("${email}_keys.hash", "w") or die("Unable to open file!");
	// 	fwrite($keyHashFile, "");
	// 	fclose($keyHashFile);
		
	// 	$keyHashFile = fopen("${email}_keys.hash", "a") or die("Unable to open file!");
	// 	foreach ($keyFileHashList as $keyFileHash) {
	// 		fwrite($keyHashFile, "\n$keyFileHash");
	// 	}
	// 	fclose($keyHashFile);
		fs.writeFile(
			`${email}_keys.hash`,
			keyFileHashListStr,
			err => { if (err) console.error(err); }
		);
	}
}


// Save
function save(email, key, data) {
	console.log(getFuncName());
	
	// $auth = false;
	var auth = false;

	// if(file_exists("${email}_password.hash")) {
	if (fs.existsSync(`${email}_password.hash`)) {
	// 	$keyHashFile = fopen("${email}_keys.hash", "r") or die("Unable to open file!");
	// 	$keyFileHashList = explode("\n", fread($keyHashFile,filesize("${email}_keys.hash")));
	// 	fclose($keyHashFile);
		var keyFileHashList = read(`${email}_keys.hash`).split("\n");
		
	// 	$keyHashFile = fopen("${email}_keys.hash", "w") or die("Unable to open file!");
	// 	fwrite($keyHashFile, "");
	// 	fclose($keyHashFile);
	
	// 	$keyHashFile = fopen("${email}_keys.hash", "a") or die("Unable to open file!");

		var keyHashListStr = "";
		
	// 	$keyHash = hash("sha256", "$key");
		var keyHash = sha256(key);
	// 	foreach ($keyFileHashList as $keyFileHash) {
		for (let keyFileHash of keyFileHashList) {
	// 		if($keyHash == $keyFileHash) {
			if (keyHash == keyFileHash) {
	// 			$auth = true;
				auth = true;
	// 			$datafile = fopen("${email}_data.json", "w") or die("Unable to open file!");
	// 			fwrite($datafile, $data);
	// 			fclose($datafile);
				fs.writeFile(
					`${email}_data.json`,
					data,
					err => { if (err) console.error(err); }
				)
	
	// 			fwrite($keyHashFile, "$keyFileHash\n");
				keyHashListStr = keyHashListStr + keyFileHash + "\n";
			}
			else {
	// 			$keyFileHash = explode(" ", $keyFileHash)[0];
				keyFileHash = keyFileHash.split(" ")[0];
	// 			if($keyHash == $keyFileHash) {
				if (keyHash == keyFileHash) {
	// 				fwrite($keyHashFile, "$keyFileHash\n");
					keyHashListStr = keyHashListStr + keyFileHash + "\n";
	// 				echo "retry";
					return "retry";
	// 				continue;
				}
	// 			if ($keyFileHash == "") { continue; }
				if (!keyFileHash) { continue; }
	// 			fwrite($keyHashFile, "$keyFileHash templock\n");
				keyHashListStr = keyHashListStr + keyFileHash + " templock\n";
			}
		}

		fs.writeFile(
			`${email}_keys.hash`,
			keyHashListStr,
			err => { if (err) console.error(err); }
		);
		
	// 	if($auth) { echo "success"; }
		if (auth) { return "success"; }
	// 	else { echo "haha"; }
		else { return "haha"; }
	
	// 	fclose($keyHashFile);
	}
	// else { echo "haha"; }
	else { return "haha"; }
}


// Load
function load(email) {
	console.log(getFuncName());

	if (fs.existsSync(`${email}_data.json`)) {
		return read(`${email}_data.json`);
	}
	return read("data.json");
}


// Validate
function validate(email, key) {
	console.log(getFuncName());
	
	// $auth = false;
	var auth = false;

	// if(file_exists("${email}_password.hash")) {
	if (fs.existsSync(`${email}_password.hash`)) {
	// 	$keyHashFile = fopen("${email}_keys.hash", "r") or die("Unable to open file!");
	// 	$keyFileHashList = explode("\n", fread($keyHashFile,filesize("${email}_keys.hash")+1));
	// 	fclose($keyHashFile);
		var keyFileHashList = read(`${email}_keys.hash`).split("\n");
	
	// 	$keyHash = hash("sha256", "$key");
		var keyHash = sha256(key);
	
	// 	$newKey = hash("sha256", sprintf("%d%d%d%d", rand(), rand(), rand(), rand()));
		var newKey =  sha256(randomKey() + randomKey() + randomKey() + randomKey());
	// 	foreach ($keyFileHashList as $keyFileHash) {
		for (let keyFileHash of keyFileHashList) {
	// 		$keyFileHash = explode(" ", $keyFileHash)[0];
			keyFileHash = keyFileHash.split(" ")[0];
	// 		$auth = ($keyHash == $keyFileHash);
			auth = (keyHash == keyFileHash);
	// 		if($auth) {
			if (auth) {
	// 			$keyHashFile = fopen("${email}_keys.hash", "r") or die("Unable to open file!");
	// 			$keyFileHashList = explode("\n", fread($keyHashFile,filesize("${email}_keys.hash")+1));
	// 			fclose($keyHashFile);
				keyFileHashList = read(`${email}_keys.hash`).split("\n");
						
	// 			unset($keyFileHashList[array_search($keyHash, $keyFileHashList)]);
				var keyFileHashListStr = rmkey(keyFileHashList, keyHash);
				
	// 			$keyHashFile = fopen("${email}_keys.hash", "w") or die("Unable to open file!");
	// 			fwrite($keyHashFile, "");
	// 			fclose($keyHashFile);
				
	// 			$keyHashFile = fopen("${email}_keys.hash", "a") or die("Unable to open file!");
	// 			foreach ($keyFileHashList as $keyFileHash) {
	// 				if ($keyFileHash == "") { continue; }
	// 				fwrite($keyHashFile, "$keyFileHash templock\n");
	// 			}
	
	// 			$newKeyHash = hash("sha256", $newKey);
				var newKeyHash = sha256(newKey);
	// 			fwrite($keyHashFile, "$newKeyHash");
				keyFileHashListStr = keyFileHashListStr + "\n" + newKeyHash;
	// 			fclose($keyHashFile);
				fs.writeFile(
					`${email}_keys.hash`,
					keyFileHashListStr,
					err => { if (err) console.error(err); }
				);
						
	// 			break;
			}
		}
	// 	if($auth) { echo $newKey; }
		if (auth) { return newKey; }
	// 	else { echo "haha"; }
		else { return "haha"; }
	}
	// else { echo "haha"; }
	else { return "haha"; }
}


// Change Password
function changePswd(email, oldPswd, newPswd) {
	console.log(getFuncName());
	
	if (fs.existsSync(`${email}_password.hash`)) {
		var oldPswdHash = sha256(oldPswd);

		if (checkAuth(email, oldPswdHash)) {
			fs.writeFile(
				`${email}_password.hash`,
				sha256(newPswd),
				err => { if (err) console.error(err); }
			);

			fs.writeFile(
				`${email}_keys.hash`, "",
				err => { if (err) console.error(err); }
			);

			if (fs.existsSync(`${email}_reset_password.hash`)) {
				fs.unlink(
					`${email}_reset_password.hash`,
					err => { if (err) console.error(err); }
				);
			}

			return "success";
		}
		return "haha";
	}
	return "failed";
}


// Account creation / Password reset
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "ackerman.quiz+noreply@gmail.com",
    pass: process.env['app password']
  }
});

function randomPassword() {
	console.log(getFuncName());
	
	return randomKey() + randomKey();
}

function pswdEmail(email, which) {
	console.log(getFuncName());
	
	if (fs.existsSync(`${email}_password.hash`)) {
		return "exists";
	}

	var pswd = randomPassword();
	
	var mailOptions = {
		from: 'ackerman.quiz+noreply@gmail.com',
		to: email,
		subject: `Quiz password ${which} email`,
		text: `Password: ${pswd}`
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if(error) {
			throw error;
		} else {
			console.log('Email Sent!');
		}
	});

	if (which == "set") {
		fs.writeFile(
			`${email}_password.hash`,
			sha256(pswd),
			err => { if (err) console.error(err); }
		);

		fs.writeFile(
			`${email}_keys.hash`,
			"",
			err => { if (err) console.error(err); }
		);

		fs.writeFile(
			`${email}_data.json`,
			"[  ]",
			err => { if (err) console.error(err); }
		);
	}
	else {
		fs.writeFile(
			`${email}_reset_password.hash`,
			sha256(pswd) +
			`\n${Date.now() + 60*60}`,
			err => { if (err) console.error(err); }
		);
	}
	
	return "success";
}


// Main handler function
async function POST(req, res) {
	console.log(getFuncName());
	
	const which = req.body.which;
	switch (which) {
		case "validate":
			res.send(validate(req.body.email, req.body.key));
		break;
			
		case "load":
			res.send(load(req.body.email));
		break;

		case "save":
			res.send(save(req.body.email, req.body.key, req.body.data));
		break;

		case "login":
			res.send(login(req.body.email, req.body.pswd));
		break;

		case "logout":
			res.send(logout(req.body.email, req.body.key));
		break;

		case "changePswd":
			res.send(changePswd(req.body.email, req.body.pswd, req.body.newPswd));
		break;
		
		case "reset":
		case "set":
			res.send(pswdEmail(req.body.email, which));
		break;

		default:
			res.send("Da ist nichts hier.");
		break;
	}
}

const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html')
});

app.post('/', (req, res) => {
	POST(req, res);
});

app.listen(3000, () => {
	// clear();
  console.log('server started\n\t' + Date());
});