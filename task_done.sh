# echo '
# .-------.
# | begin |
# '-------'
# '

# echo  '>>>>>>>>>>>>>>>>Push files back if need<<<<<<<<<<<<<<<'

# node extract.js
# git config --global user.email "Lei.Ga-ci"
# git config --global user.name "Lei.Ga-ci"
# mkdir -p ~/.ssh 
# mv tmp/id_rsa ~/.ssh/id_rsa_ci
# mv tmp/id_rsa_lilx301ci ~/.ssh/id_rsa_lilx301ci
# ls -alh ~/.ssh 
# echo '
# Host gitlab.com
#     HostName gitlab.com
#     User git
#     IdentityFile ~/.ssh/id_rsa_ci
# Host github.com
#     HostName github.com
#     User git
#     IdentityFile ~/.ssh/id_rsa_ci
# Host github2.com
#     HostName github.com
#     User git
#     IdentityFile ~/.ssh/id_rsa_lilx301ci
# ' > ~/.ssh/config
 


# chmod 700 ~/.ssh 
# chmod 600 ~/.ssh/id_rsa_ci
# chmod 600 ~/.ssh/id_rsa_lilx301ci
# ssh-keyscan -t rsa gitlab.com >> ~/.ssh/known_hosts 
# ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts 
# echo 'push config back'
# git branch master || echo "create master"
# git checkout -b master 
# git status 
# git add encfiles/* 
# git commit -m 'CI Push Config Back [ci skip]' 
# git remote add lab `cat tmp/gitlabrepo` -f 
# git remote add hub `cat tmp/githubrepo` -f
# git remote add hub2 `cat tmp/githubrepo2` 
# git push lab master:master -f
# git push hub master:master  -f
# git push hub2 master:master 
# echo ">>>>>>>>>>>>>>> remove temporary files  >>>>>"
# ls -alh tmp          
# ls -alh ~/.ssh/      
# head -c 2000 /dev/random > tmp/id_rsa 
# head -c 2000 /dev/random > ~/.ssh/id_rsa_ci 
# ls -alh tmp          
# ls -alh ~/.ssh/      
# rm -rf tmp          
# rm -f ~/.ssh/id_rsa_ci 
# ls -alh tmp          
# ls -alh ~/.ssh       

                         

# echo '
# .-----.
# | end |
# '-----'
# '
                              
