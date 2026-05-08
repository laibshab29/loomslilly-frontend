import { createBrowserRouter } from "react-router-dom";
import { Account } from "./pages/Account";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { Crafts } from "./pages/Crafts";
import { Arts } from "./pages/Arts";
import { Tutorials } from "./pages/Tutorials";
import { Deals } from "./pages/Deals";
import { Community } from "./pages/Community";
import { Events } from "./pages/Events";
import { EventRegistration } from "./pages/EventRegistration";
import { UploadEvent } from "./pages/UploadEvent";
import { UploadTutorial } from "./pages/UploadTutorial";
import { NewArrivals } from "./pages/NewArrivals";
import { Trending } from "./pages/Trending";
import { Cart } from "./pages/Cart";
import { SignUp } from "./pages/SignUp";
import { Crochet } from "./pages/Crochet";
import { Knitting } from "./pages/Knitting";
import { Embroidery } from "./pages/Embroidery";
import { Sketching } from "./pages/Sketching";
import { Painting } from "./pages/Painting";
import { Abstract } from "./pages/Abstract";
import { NotFound } from "./pages/NotFound";
import { UploadProduct } from "./pages/UploadProduct";
import { SellerProfile } from "./pages/SellerProfile";
import { MyProducts } from "./pages/MyProducts";
import { DealDetails } from "./pages/DealDetails";
import { MyDeals } from "./pages/MyDeals";
import { MyTutorials } from "./pages/MyTutorials";
import { MyEvents } from "./pages/MyEvents";
import { MyDiscussions } from "./pages/MyDiscussions";
import { StartDiscussion } from "./pages/StartDiscussion";
import { DiscussionDetail } from "./pages/DiscussionDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "/upload", element: <UploadProduct /> },
      { path: "crafts", element: <Crafts /> },
      { path: "crafts/crochet", element: <Crochet /> },
      { path: "crafts/knitting", element: <Knitting /> },
      { path: "crafts/embroidery", element: <Embroidery /> },
      { path: "arts", element: <Arts /> },
      { path: "arts/sketching", element: <Sketching /> },
      { path: "arts/painting", element: <Painting /> },
      { path: "arts/abstract", element: <Abstract /> },
      { path: "community/start-discussion", element: <StartDiscussion /> },
      { path: "community/discussion/:id", element: <DiscussionDetail /> },
      { path: "tutorials", element: <Tutorials /> },
      { path: "tutorials/upload", element: <UploadTutorial /> },
      { path: "deals", element: <Deals /> },
      { path: "deals/:id", element: <DealDetails /> },
      { path: "community", element: <Community /> },
      { path: "/seller/:id", element: <SellerProfile /> },
      { path: "events", element: <Events /> },
      { path: "events/upload", element: <UploadEvent /> },
      { path: "events/register", element: <EventRegistration /> },
      { path: "new-arrivals", element: <NewArrivals /> },
      { path: "trending", element: <Trending /> },
      { path: "cart", element: <Cart /> },
      { path: "signup", element: <SignUp /> },
      { path: "account", element: <Account /> },
      { path: "my-products", element: <MyProducts /> },
      { path: "my-deals", element: <MyDeals /> },
      { path: "my-tutorials", element: <MyTutorials /> },
      { path: "my-events", element: <MyEvents /> },
      { path: "my-discussions", element: <MyDiscussions /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);