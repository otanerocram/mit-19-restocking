// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 30, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 40, instock: 3 },
  { name: "Beans", country: "USA", cost: 20, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 10, instock: 8 },
];

const useDataApi = (initialUrl, initialData, setItems) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  // console.log(`useDataApi called`);
  useEffect(() => {
    // console.log("useEffect Called");
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        const tempData = result.data.data.map((el, idx) => el.attributes);
        setItems(tempData);

        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: tempData });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = () => {
  const { useState, useEffect } = React;

  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const [query, setQuery] = useState("http://localhost:1337/api/products");

  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    },
    setItems
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  // Fetch Data
  const addToCart = (e) => {
    let item = items.filter((item) => item.name == e.target.name);

    let updatedStock;
    const newProds = items.map((item) => {
      if (item.name === e.target.name && item.instock > 0) {
        updatedStock = item.instock - 1;
        item.instock -= 1;
      }
      return item;
    });

    setItems([...newProds]);

    if (updatedStock >= 0) {
      setCart([...cart, ...item]);
    }

    console.log(`add to Cart ${JSON.stringify(item)}`);
    doFetch(query);
  };

  const deleteCartItem = (index) => {
    const newCart = cart.filter((item, i) => index !== i);
    console.log(`newCart ${JSON.stringify(newCart)}`);
    const foundItem = cart.filter((el, idx) => idx === index);
    const newProds = items.map((el, idx) => {
      if (el.name === foundItem[0].name) {
        el.instock += 1;
      }
      return el;
    });
    setCart(newCart);
    setItems(newProds);
  };

  let list = items.map((item, index) => {
    let n = index + 236;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <tr>
        <td>
          <Image src={url} width={70} roundedCircle></Image>
        </td>
        <td>{item.name}</td>
        <td>{item.instock}</td>
        <td>${item.cost}</td>
        <td>
          <input
            className="btn btn-success"
            name={item.name}
            type="submit"
            onClick={addToCart}
            value="Add to Cart"
          ></input>
        </td>
      </tr>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <>
        <tr key={index}>
          <td>{item.country}</td>
          <td>{item.name}</td>
          <td>$ {item.cost}</td>
          <td>
            <input
              className="btn btn-danger"
              name={item.name}
              type="submit"
              onClick={()=> deleteCartItem(index)}
              value="Delete"
            ></input>
          </td>
        </tr>
        {/* <Card key={index}>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
              {item.name}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse
            onClick={() => deleteCartItem(index)}
            eventKey={1 + index}
          >
            <Card.Body>
              $ {item.cost} from {item.country}
            </Card.Body>
          </Accordion.Collapse>
        </Card> */}
      </>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    // console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(query);
  };

  useEffect(() => {
    // console.log("items");
  }, [items]);

  return (
    <Container className="pb-4">
      <Row>
        <Col xs={12}>
          <div className="card">
            <h5 className="card-header">Product List</h5>
            <div className="card-body">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Picture</th>
                    <th scope="col">Name</th>
                    <th scope="col">Stock Available</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>{list}</tbody>
              </table>

              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="URL Endpoint"
                  aria-label="URL Endpoint"
                  aria-describedby="button-addon2"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button
                  className="btn btn-outline-success"
                  type="submit"
                  id="button-addon2"
                  onClick={(e) => {
                    console.log("clic");
                    restockProducts(`http://localhost:1337/${query}`);
                    e.preventDefault();
                  }}
                >
                  LOAD
                </button>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className="card">
            <h5 className="card-header">
              <img src="images/cart4.svg" alt="" /> My Shopping Cart:
            </h5>
            <div className="card-body">
              {cartList.length === 0 ? (
                <p>
                  Your Cart is Empty, please select any item on Product List
                </p>
              ) : (
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Country</th>
                      <th scope="col">Name</th>
                      <th scope="col">Unit Price</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>{cartList}</tbody>
                </table>
                // <Accordion>{cartList}</Accordion>
              )}
            </div>
          </div>
        </Col>
        <Col>
          <div className="card">
            <h5 className="card-header">Checkout</h5>
            <div className="card-body">
              <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
              <div> {finalList().total > 0 && finalList().final} </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
