

``` mermaid
graph TD
	User["User<br/>
		username: String<br/>
		password: String<br/>
		email: Email<br/>
	"]


	Driver["Driver<br/>
		name: String<br/>
	"]


	Delivery["Delivery<br/>
		by: User<br/>
		driver: Driver<br/>
		from: Point<br/>
		to: Point
	"]
```
