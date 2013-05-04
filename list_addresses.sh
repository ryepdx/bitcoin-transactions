#!/bin/bash
dir=${1-'.'}
ls ${dir} | grep .key\$ | sed -e 's/\.key$//'
