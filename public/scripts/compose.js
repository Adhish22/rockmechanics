var s ="";

while (s!= "rocknroll")
{
s=prompt("Please Enter Your Password");
if (s=="rocknroll")
{
    res.redirect("/compose");
}
else
{
alert("Incorrect password-Try again");
}
}