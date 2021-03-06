create database project_management;
use project_management;
create table projects
(
    project_id int not null,
    project_name varchar(30),
    creator varchar(30),
    database_id int,
    username varchar(30),
    password varchar(30),
    PRIMARY KEY(project_id)
);
create table colabs
(
    user_id int,
    project_id int,
    FOREIGN KEY(project_id) REFERENCES projects(project_id)
);
create table queries
(
    query_id int not null,
    user_id int,
    database_id int,
    query varchar(255),
    query_date datetime
);

insert into colabs
    (user_id,project_id)
values(1, 1);
insert into colabs
    (user_id,project_id)
values(1, 2);
insert into colabs
    (user_id,project_id)
values(1, 3);
insert into colabs
    (user_id,project_id)
values(2, 3);

insert into projects
    (project_id,project_name,creator,database_id,username,password)
values(1, 'Sparkling water', 'One', 1, "user1", "1234");
insert into projects
    (project_id,project_name,creator,database_id,username,password)
values(2, 'To your left', 'woP', 2, "user2", "password");
insert into projects
    (project_id,project_name,creator,database_id,username,password)
values(3, 'BenJHov', 'Rrec', 3, "user3", "root");
insert into projects
    (project_id,project_name,creator,database_id,username,password)
values(4, 'Excluded', 'Nahman', 4, "user4", "user4");


-- select projects.project_name,projects.creator from projects inner join colabs on projects.project_id=colabs.project_id where colabs.user_id=2;
