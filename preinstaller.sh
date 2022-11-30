#!/bin/bash
echo 'Preinstaller started.'

#sudo yum -y update

sudo yum -y install git

sudo git clone https://github.com/apache/bigtop.git /bigtop-home 

sleep 20

echo 'Preinstaller finished.'

