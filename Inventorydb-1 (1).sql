create database inventorydb
go
use inventorydb
go

create table users(
	userid varchar(50) primary key,
	name varchar(50) not null,
	pwd varchar(20) not null,
	phone varchar(20),
	gender varchar(20),
	city varchar(50),
	role varchar(20),
	createdon datetime
)
go
create table category(
catid int primary key identity,
catname varchar(50) not null
)
go

create table product(
prodid int primary key identity,
pname varchar(50),
pcat int foreign key references category(catid),
price decimal(15,2),
qty int,
photo varchar(50),
sellerid varchar(50) foreign key references users(userid)
)
go

create table address(
id int primary key identity,
city varchar(100),
state varchar(50),
country varchar(50),
zip varchar(10)
)
go

create table payments(
id int primary key identity,
nameoncard varchar(50),
cardno varchar(16),
amount decimal(15,2),
paymentdate datetime
)
go


create table orders(
orderid int primary key identity,
orderdate datetime,

addressid int foreign key references address(id),
paymentid int foreign key references payments(id),
customerid varchar(50) foreign key references users(userid)
)
go

create table orderdetails(
id int primary key identity,
orderid int foreign key references orders(orderid),
prodid int foreign key references product(prodid),
qty int,
status varchar(50)
)
go

insert into users(userid,name,pwd,role) values('admin','Administrator','admin','Admin')

select * from users
