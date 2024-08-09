import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse)   
 {
  const { address } = req.query;

  try {
    const   
 geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=`);
    const coordinates = geocodingResponse.data.results[0].geometry.location;

    const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?location=${coordinates.lat},${coordinates.lng}&key=`);
    const placeData = placesResponse.data.result;

    res.status(200).json({ coordinates, placeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
}
