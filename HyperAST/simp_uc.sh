#!/bin/bash
echo $1/$2 $3
/usr/bin/time -f "User:\n%U\nSys:\n%S\nElapsed:\n%E\nCpu:\n%P\nMaxMem:\n%M\nmajor page_faults:\n%F\nminor page_faults:\n%R" target/release/simple_usecase $1/$2 "" $3 batch_simple_usecase/$2.csv &> batch_simple_usecase/$2.log
tail -n20 batch_simple_usecase/$2.log
