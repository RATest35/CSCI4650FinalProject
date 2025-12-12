
import { Inter } from 'next/font/google'
import {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Form, Input, message, Modal, Select, Space, Table, Tag} from "antd";
import { faker } from '@faker-js/faker';
import {Item} from ".prisma/client";
const inter = Inter({ subsets: ['latin'] })

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [lowStockOpen, setLowStockOpen] = useState(false);


  const onFinish = async (values: any) => {
    if (editingItem) {
      return onEdit(values);
    }

    // otherwise, create new item
    fetch('/api/create_item', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then(async response => {
        if (response.status === 200) {
          const item = await response.json();
          message.success('Created item ' + item.name);
          setItems([...items, item]);
          setIsModalOpen(false);
        } else {
          message.error(`Failed to create item`);
        }
      })
      .catch(err => message.error(err));
  };


  const onDelete = async (item: any) => {
    const {id} = item;
    setIsModalOpen(false);
    fetch('/api/delete_item', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    }).then(async response => {
      if (response.status === 200) {
        await response.json();
        message.success('Deleted item ' + item.name);
        setItems(items.filter(u=> u.id !== id ));

      } else message.error(
          `Failed to delete item:\n ${item.name}`);
    }).catch(res=>{message.error(res)})
  };


  const onEdit = async (values: any) => {
    fetch('/api/edit_item', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...values, id: editingItem?.id })
    })
      .then(async response => {
        if (response.status === 200) {
          const updated = await response.json();
          message.success("Updated item " + updated.name);

          setItems(items.map(i => (i.id === updated.id ? updated : i)));
          setIsModalOpen(false);
          setEditingItem(null);

        } else message.error("Failed to update item");
      })
      .catch(err => message.error(err));
  };

  const showLowStock = async () => {
    setIsModalOpen(false);
    setEditingItem(null);
    fetch('/api/low_stock')
      .then(res => res.json())
      .then(data => {
        setLowStockItems(data);
        setLowStockOpen(true);
      })
      .catch(err => message.error(err));
  };


  const columns: ColumnsType<Item> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    sorter: (a, b) => a.id - b.id,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    sorter: (a, b) => a.quantity - b.quantity,
    render: (q: number) => (
      <span style={{ color: q < 7 ? "red" : "inherit" }}>
        {q}
      </span>
    ),
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    sorter: (a, b) => a.category.localeCompare(b.category),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    sorter: (a, b) => a.price - b.price,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a onClick={() => showModal(record)}>Edit</a>
        <a onClick={() => onDelete(record)}>Delete</a>
      </Space>
    ),
  },
];


  const onReset = () => {
    form.resetFields();
  };


  const showModal = (item?: Item) => {
    setIsModalOpen(true);

    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
  };


  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  useEffect(()=>{
    fetch('/api/all_item', {method: "GET"})
        .then(res => {
          res.json().then(
              (json=> {setItems(json)})
          )
        })
  }, []);

  if (!items) return "Give me a second";

  return  <>
    <Button type="primary" onClick={() => showModal()}>
      Add Item
    </Button>
    <Button danger style={{ marginLeft: 10 }} onClick={showLowStock}>
      Low Stock Items
    </Button>
    <Modal
      title="Low Stock Items (Quantity < 7)"
      open={lowStockOpen}
      onCancel={() => setLowStockOpen(false)}
      footer={null}
      width={600}
    >
      {lowStockItems.length === 0 ? (
        <p>No low stock items 🎉</p>
      ) : (
        <Table
          dataSource={lowStockItems}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "ID", dataIndex: "id" },
            { title: "Name", dataIndex: "name" },
            { title: "Quantity", dataIndex: "quantity" },
            { title: "Category", dataIndex: "category" },
            { title: "Price", dataIndex: "price" },
          ]}
        />
      )}
    </Modal>
    <Modal title={editingItem ? "Edit Item" : "Add Item"}
            onCancel={handleCancel}
           open={isModalOpen} footer={null}  width={800}>
      <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout} >
          <Button type="primary" htmlType="submit">
            {editingItem ? "Update" : "Submit"}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button  htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    {/*<p>{JSON.stringify(users)}</p>*/}
    <Table columns={columns} dataSource={items} />;
  </>;


}
