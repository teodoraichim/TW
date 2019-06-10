CREATE DATABASE  manage_users;
use manage_users;

create table users
     (
     userId int not null auto_increment,
     username varchar(25) not null,
     email varchar(50) not null,
     password varchar(80) not null,
    status int default 0,
     primary key(userId)
     );
  

create table codes
     (
     userId int not null,
     code varchar(80) not null,
     foreign key(userId) references users(userId)
     );