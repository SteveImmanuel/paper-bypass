# Paper Bypass

## Introduction
This repo contains script to bypass paywall for academic papers in journals. Currently, it only supports IEEE.
Currently, most papers in IEEE are behind a paywall where you have to be either a member or pay for each paper.
There are other services such as Sci-Hub that bypasses the paywall, however its database is limited. 
Without any way to contribute to the completeness of the database, some papers remain locked behind the paywall.

IEEE however allows you to access most papers for free if you are accessing it from a valid network such as universities or other institutions.
This script leverage this feature to bypass the paywall. Note that this method is completely legal as **you need to have** access to any network that allows you to access IEEE papers for free.

## Method
IEEE checks if you are accessing the paper from a valid network by checking the IP address of the request. Therefore, you can set up a VPN server in the valid network and connect to it from your local machine. However, most likely the network is controlled by the IT department and you cannot set up any port forwarding that allows you to connect to your local machine from outside the network.

To mitigate that, this script uses Tailscale and SSH tunneling to connect your local machine to the computer in the network. TLDR, Tailscale lets all of your devices to be in the same network regardless of where they are. Now that all devices are in the same network, you can use SSH tunneling to connect to your local machine from the computer in the network. This way, the IP address of the request will be the same as the IP address of the computer in the network, which is a valid IP address.

After the networking setup is done, the script will simulate a browser using Firefox, automatically download the paper, and give you the direct download link.

## Setup
Make sure that you have [Tailscale](https://tailscale.com/) installed on both your local machine and the computer in the valid network and they can ommunicate to each other.

Create an SSH key pair on your local machine and copy the public key to the computer in the valid network. Make sure that you can SSH to the computer in the valid network using the private key without typing any password. Put this private key in the `data/key` directory with the name `ssh_priv_key.pem`.

Additionally, to make SSH smoother on first connection, make sure that the computer in the valid network is added to the known hosts on your local machine. You can do this by connecting manually to the computer in the valid network using SSH and type `yes` when prompted. Then, copy the `known_hosts` file from `~/.ssh/known_hosts` to `data/key/known_hosts`.