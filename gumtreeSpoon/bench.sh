
repo1=$1
echo $repo1
repo2=$2
echo $repo2
pwd
root=$(pwd)
echo $root
read -r commit_id
echo "going in repo instance $repo1"
cd $repo1
pwd
echo "exec git checkout $commit_id"
git checkout $commit_id
cd $root
before=$repo1
after=$repo2
while IFS= read -r commit_id; do
    echo "going in repo instance $after"
    cd $after
    pwd
    echo "exec git checkout $commit_id"
    git checkout $commit_id
    cd $root
    pwd
    echo "exec bench on $before and $after"
    cd $before
    git rev-parse HEAD
    cd $root
    cd $after
    git rev-parse HEAD
    cd $root
    # ls $before
    # ls $after
    tmp=$before
    before=$after
    after=$tmp
done

# while IFS= read -r commit_id; do
#   echo "Checking out commit: $commit_id"
#   git checkout "$commit_id"
#   echo "Executing ls:"
#   ls
#   echo "-------------------------------------"
# done