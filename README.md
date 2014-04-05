#Huddles

Huddles is a group creation guide that helps maintaining and extending your social and professional network.

A huddle gathers people with common interests and works as a communication channel for linking people based on skillsets.

##Installing and running
Command line:

    mkdir huddles
    phonegap create huddles
    cd huddles
    git init
    git remote add origin https://github.com/freko247/Huddles.git
    git fetch
    git checkout -t -f origin/master
    git clean -f -d
    cordova add platform android
    phonegap run android
