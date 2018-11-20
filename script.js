const classNames = {
  TODO_ITEM: "todo-container",
  TODO_CHECKBOX: "todo-checkbox",
  TODO_TEXT: "todo-text",
  TODO_DELETE: "todo-delete",
  TODO_CROSSED: "todo-crossed"
};

const list = document.getElementById("todo-list");
const itemCountSpan = document.getElementById("item-count");
const uncheckedCountSpan = document.getElementById("unchecked-count");
const textContainer = document.getElementById("text-container");

/* stateless component to create to render counts
 */
const Count = props => {
  return <strong className={classNames.TODO_TEXT}>{props.count}</strong>;
};
Count.propTypes = {
  count: PropTypes.number
};
/* stateless component to create CheckBox Widget
 */

const Checkbox = ({ type = "checkbox", name, checked = false, onChange }) => (
  <input
    className={classNames.TODO_CHECKBOX}
    type={type}
    name={name}
    checked={checked}
    onChange={onChange}
  />
);
Checkbox.propTypes = {
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  name: PropTypes.number
};

/* stateless component to create TodolistItem counts
 * Displays TodoListItem consisting of Checkbox , Text and Delete Button to delete List Item
 */
const TodoListItem = props => {
  return (
    <li className={classNames.TODO_ITEM}>
      <Checkbox
        name={props.id}
        checked={props.checked}
        onChange={props.checkItem}
      />
      {props.checked ? (
        <strike className={classNames.TODO_CROSSED}>{props.text}</strike>
      ) : (
        <span className={classNames.TODO_TEXT}>{props.text}</span>
      )}

      <button
        className={classNames.TODO_DELETE}
        name={props.id}
        onClick={props.deleteItem}
      >
        delete
      </button>
    </li>
  );
};

TodoListItem.propTypes = {
  id: PropTypes.number,
  checked: PropTypes.bool,
  checkItem: PropTypes.func,
  text: PropTypes.string,
  deleteItem: PropTypes.func
};

const ListItems = props => {
  return props.items.map(item => {
    return (
      <TodoListItem
        key={item.id}
        {...item}
        checkItem={props.checkListItem}
        deleteItem={props.deleteItem}
      />
    );
  });
};

/* Once class component to manage state
 * Wrapped in Higher Order component to store component on the localstorage.
 *Using local storage as external storage to access state outside component.
 */
class CreateNewTodo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentinputVal: "",
      listItems: props.listItems,
      isHidden: props.isHidden
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.checkItem = this.checkItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.cleanComponent = this.cleanComponent.bind(this);
  }
  handleChange(e) {
    let val = e.target.value;
    this.setState(prevState => {
      return {
        currentinputVal: val
      };
    });
  }

  //Method to toggle checking of Items on a list
  checkItem(event) {
    const id = event.target.name;
    let checkFunc = this.checkItem;
    let deleteFunc = this.deleteItem;

    let itemIndex = this.state.listItems.findIndex(item => {
      return item.id === parseInt(id);
    });
    this.state.listItems.forEach(item => {
      if (item.id === parseInt(id)) {
        item.checked = !item.checked;
      }
    });

    this.setState(
      {
        listItems: [...this.state.listItems]
      },
      () => {
        this.props.save("currentState", JSON.stringify(this.state));
        let unCheckedItemCount = this.state.listItems.filter(item => {
          return item.checked === false;
        }).length;
        ReactDOM.render(
          <Count count={unCheckedItemCount} />,
          uncheckedCountSpan
        );
        ReactDOM.render(
          <ListItems
            items={this.state.listItems}
            checkListItem={checkFunc}
            deleteItem={deleteFunc}
          />,
          list
        );
      }
    );
  }

  //method to delete item from list
  deleteItem(e) {
    const id = event.target.name;
    let checkFunc = this.checkItem;
    let deleteFunc = this.deleteItem;
    let itemIndex = this.state.listItems.findIndex(item => {
      return item.id === parseInt(id);
    });
    this.state.listItems.splice(itemIndex, 1);
    this.setState(
      {
        listItems: [...this.state.listItems]
      },
      () => {
        this.props.save("currentState", JSON.stringify(this.state));
        ReactDOM.render(
          <Count count={this.state.listItems.length} />,
          itemCountSpan
        );
        let unCheckedItemCount = this.state.listItems.filter(item => {
          return item.checked === false;
        }).length;
        ReactDOM.render(
          <Count count={unCheckedItemCount} />,
          uncheckedCountSpan
        );
        ReactDOM.render(
          <ListItems
            items={this.state.listItems}
            checkListItem={checkFunc}
            deleteItem={deleteFunc}
          />,
          list
        );
      }
    );
  }
  handleClick() {
    let checkFunc = this.checkItem;
    let deleteFunc = this.deleteItem;
    if (this.state.currentinputVal) {
      this.setState(
        {
          listItems: [
            {
              id: Date.now(),
              text: this.state.currentinputVal,
              checked: false
            },
            ...this.state.listItems
          ],
          currentinputVal: "",
          isHidden: true
        },
        () => {
          this.props.save("currentState", JSON.stringify(this.state));

          let unCheckedItemCount = this.state.listItems.filter(item => {
            return item.checked === false;
          }).length;
          ReactDOM.render(
            <Count count={unCheckedItemCount} />,
            uncheckedCountSpan
          );
          ReactDOM.render(
            <Count count={this.state.listItems.length} />,
            itemCountSpan
          );

          ReactDOM.render(
            <ListItems
              items={this.state.listItems}
              checkListItem={checkFunc}
              deleteItem={deleteFunc}
            />,
            list
          );
          //ReactDOM.unmountComponentAtNode(textContainer);
        }
      );
    }
  }
  cleanComponent() {
    this.props.remove("currentState");
  }
  componentWillUnmount() {
    this.cleanComponent();
    window.removeEventListener("beforeunload", this.cleanComponent);
  }
  render() {
    const { isHidden } = this.state;
    return (
      <React.Fragment>
        {!isHidden ? (
          <span>
            <input
              type="text"
              onChange={this.handleChange}
              value={this.state.currentinputVal}
            />
            <button onClick={this.handleClick}>save</button>
          </span>
        ) : null}
      </React.Fragment>
    );
  }
}

/**
 * Creating Higher order component to Add external storage functionality
 * to a component. Will enhance CreateNewTodo Component with this functionality
 */
const AddExternalStorage = WrappedComponent => {
  class HOC extends React.Component {
    state = {
      localStorageAvailable: false
    };

    componentDidMount() {
      this.checkLocalStorageExists();
    }

    checkLocalStorageExists() {
      const testKey = "test";

      try {
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        this.setState({ localStorageAvailable: true });
      } catch (e) {
        this.setState({ localStorageAvailable: false });
      }
    }

    load = key => {
      if (this.state.localStorageAvailable) {
        return localStorage.getItem(key);
      }

      return null;
    };

    save = (key, data) => {
      if (this.state.localStorageAvailable) {
        localStorage.setItem(key, data);
      }
    };

    remove = key => {
      if (this.state.localStorageAvailable) {
        localStorage.removeItem(key);
      }
    };

    render() {
      return (
        <WrappedComponent
          load={this.load}
          save={this.save}
          remove={this.remove}
          {...this.props}
        />
      );
    }
  }

  return HOC;
};

CreateNewTodo.propTypes = {
  load: PropTypes.func,
  save: PropTypes.func,
  remove: PropTypes.func,
  isHidden: PropTypes.bool,
  listItems: PropTypes.array
};

const StoredCreateNewTodo = AddExternalStorage(CreateNewTodo);

function newTodo() {
  let isHidden = false;
  let listItems = [];
  let storedState = JSON.parse(localStorage.getItem("currentState"));
  if (storedState) {
    listItems = storedState.listItems;
  }
  if (textContainer.children.length === 0) {
    ReactDOM.unmountComponentAtNode(textContainer);
    ReactDOM.render(
      <StoredCreateNewTodo isHidden={isHidden} listItems={listItems} />,
      textContainer
    );
  }
}
