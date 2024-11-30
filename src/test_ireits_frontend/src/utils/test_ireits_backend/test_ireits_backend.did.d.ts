import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Document {
  'id' : bigint,
  'hash' : string,
  'timestamp' : bigint,
  'doc_type' : { 'Inspection' : null } |
    { 'Contract' : null } |
    { 'Deed' : null } |
    { 'Title' : null } |
    { 'Other' : null },
}
export interface Property {
  'id' : bigint,
  'nft_id' : [] | [string],
  'status' : { 'Available' : null } |
    { 'Sold' : null } |
    { 'UnderContract' : null },
  'documents' : Array<Document>,
  'owner' : Principal,
  'description' : string,
  'price' : number,
  'location' : string,
}
export interface Transaction {
  'id' : bigint,
  'status' : { 'Cancelled' : null } |
    { 'Completed' : null } |
    { 'Pending' : null },
  'seller' : Principal,
  'property_id' : bigint,
  'timestamp' : bigint,
  'buyer' : Principal,
  'price' : number,
}
export interface _SERVICE {
  'add_document' : ActorMethod<
    [
      bigint,
      { 'Inspection' : null } |
        { 'Contract' : null } |
        { 'Deed' : null } |
        { 'Title' : null } |
        { 'Other' : null },
      string,
    ],
    boolean
  >,
  'assign_agent' : ActorMethod<[bigint, Principal], boolean>,
  'complete_transaction' : ActorMethod<[bigint], boolean>,
  'get_all_properties' : ActorMethod<[], Array<Property>>,
  'get_property' : ActorMethod<[bigint], [] | [Property]>,
  'get_transaction' : ActorMethod<[bigint], [] | [Transaction]>,
  'get_user_properties' : ActorMethod<[Principal], Array<Property>>,
  'initiate_transaction' : ActorMethod<[bigint], bigint>,
  'list_property' : ActorMethod<[number, string, string], Property>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
