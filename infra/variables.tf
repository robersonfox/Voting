variable "region" {
  default = "us-east-1"
}

variable "name" {
  default = "server-01"
}

variable "env" {
  default = "prod"
}

variable "ami" {
  default = "ami-0e83be366243f524a"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "repo" {
  default = "https://github.com/robersonfox/pautas"
}