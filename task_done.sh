echo '
.-------.
| begin |
'-------'
'

echo  '>>>>>>>>>>>>>>>>Push files back if need<<<<<<<<<<<<<<<'
node extract.js
git config --global user.email "Lei.GitLabCI"
git config --global user.name "Lei.GitLabCI"
mkdir -p ~/.ssh 
mv tmp/id_rsa ~/.ssh/id_rsa_ci
ls -alh ~/.ssh 
echo '
Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_rsa_ci
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_ci
Host github2.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_lilx301ci
' > ~/.ssh/config
 


chmod 700 ~/.ssh 
chmod 600 ~/.ssh/id_rsa_ci
ssh-keyscan -t rsa gitlab.com >> ~/.ssh/known_hosts 
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts 
echo 'push config back'
git branch master || echo "create master"
git checkout  master 
git status 
git add encfiles/* 
git commit -m 'CI Push Config Back [ci skip]' 
git remote add lab `cat tmp/gitlabrepo` 
git remote add hub `cat tmp/githubrepo` 
git push lab master:master 
git push hub master:master 
echo ">>>>>>>>>>>>>>> remove temporary files  >>>>>"
ls -alh tmp          
ls -alh ~/.ssh/      
head -c 2000 /dev/random > tmp/id_rsa 
head -c 2000 /dev/random > ~/.ssh/id_rsa_ci 
ls -alh tmp          
ls -alh ~/.ssh/      
rm -rf tmp          
rm -f ~/.ssh/id_rsa_ci 
ls -alh tmp          
ls -alh ~/.ssh       

                         

echo '
.-----.
| end |
'-----'
'
                              
